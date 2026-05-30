import { IpcMainInvokeEvent } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';
import { buildConcatList, ffmpeg, type ProgressInfo } from 'mediaforge';
import type { SplitBlock, SplitFixedDetails } from '../../shared/types';
import { IpcChannel } from '../../shared/ipc';

export type { SplitBlock, SplitFixedDetails };

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

process.env.FFMPEG_PATH = ffmpegPath;

const progressReportRateMs = 1000;

export function checkVersion(): void {
  console.log(`ffmpegPath: ${ffmpegPath}`);
}

export const getRandomString = (): string => {
  return crypto.randomBytes(4).readUInt32LE(0).toString();
};

export type FfmpegProgressData = ProgressInfo;

function runFfmpeg(
  build: () => ReturnType<typeof ffmpeg>,
  progress?: (data: ProgressInfo) => void,
  totalDurationUs?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = build()
      .setBinary(ffmpegPath)
      .enableProgress()
      .spawn({ parseProgress: true, totalDurationUs });

    proc.emitter.on('end', resolve);
    proc.emitter.on('error', reject);
    if (progress) proc.emitter.on('progress', progress);
  });
}

export const splitVideoFile = (
  inputFilePath: string,
  block: SplitBlock,
  progress?: (data: ProgressInfo) => void
): Promise<string> => {
  const clipPath = path.join(os.tmpdir(), `clip-${getRandomString()}.mp4`);

  return runFfmpeg(
    () =>
      ffmpeg(inputFilePath)
        .seekInput(block.startSeconds)
        .inputDuration(block.durationSeconds)
        .output(clipPath)
        .videoCodec('copy')
        .audioCodec('copy'),
    progress,
    block.durationSeconds * 1_000_000
  ).then(() => clipPath);
};

export const concatVideoFiles = (
  filePaths: string[],
  outputPath: string,
  progress?: (data: ProgressInfo) => void
): Promise<string> => {
  const scriptFilePath = path.join(os.tmpdir(), `list-${getRandomString()}.txt`);
  fs.writeFileSync(scriptFilePath, buildConcatList(filePaths));

  return runFfmpeg(
    () =>
      ffmpeg()
        .input(scriptFilePath, { format: 'concat', extraArgs: ['-safe', '0'] })
        .output(outputPath)
        .videoCodec('copy')
        .audioCodec('copy'),
    progress
  ).then(() => scriptFilePath);
};

export async function splitFixedLength(
  event: IpcMainInvokeEvent,
  details: SplitFixedDetails
): Promise<void> {
  let lastProgressSent = Date.now();

  event.sender.send(IpcChannel.SplitStart, { matchKey: details.matchKey });

  const videoParts = await Promise.all(
    details.blocks.map((block) =>
      splitVideoFile(details.inputFile, block, (progress) => {
        const msSinceLastUpdate = Date.now() - lastProgressSent;
        if (msSinceLastUpdate < progressReportRateMs) return;
        lastProgressSent = Date.now();
        event.sender.send(IpcChannel.SplitProgress, {
          matchKey: details.matchKey,
          percent: progress.percent ?? 0,
        });
      })
    )
  );

  await concatVideoFiles(videoParts, details.outputFile, (progress) => {
    const msSinceLastUpdate = Date.now() - lastProgressSent;
    if (msSinceLastUpdate < progressReportRateMs) return;
    lastProgressSent = Date.now();
    event.sender.send(IpcChannel.SplitProgress, {
      matchKey: details.matchKey,
      percent: progress.percent ?? 0,
    });
  });

  event.sender.send(IpcChannel.SplitEnd, { matchKey: details.matchKey });
}
