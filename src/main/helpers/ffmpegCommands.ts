import path from 'path';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';
import { buildConcatList, ffmpeg, type ProgressInfo } from 'mediaforge';
import type { SplitBlock, SplitEvent, SplitFixedDetails } from '../../shared/types';

export type { SplitBlock, SplitFixedDetails };

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

process.env.FFMPEG_PATH = ffmpegPath;

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

/**
 * Split one match into its output clip, emitting lifecycle events through
 * `onEvent`. Progress is emitted on every ffmpeg tick — rate-limiting is a
 * transport concern and lives in the Electron adapter, not here. This function
 * knows nothing about IPC, which is what makes it testable through `onEvent`.
 */
export async function splitFixedLength(
  details: SplitFixedDetails,
  onEvent: (event: SplitEvent) => void
): Promise<void> {
  const { matchKey } = details;
  const emitProgress = (progress: ProgressInfo): void =>
    onEvent({ type: 'progress', matchKey, percent: progress.percent ?? 0 });

  onEvent({ type: 'start', matchKey });

  const videoParts = await Promise.all(
    details.blocks.map((block) =>
      splitVideoFile(details.inputFile, block, emitProgress)
    )
  );

  await concatVideoFiles(videoParts, details.outputFile, emitProgress);

  onEvent({ type: 'end', matchKey });
}
