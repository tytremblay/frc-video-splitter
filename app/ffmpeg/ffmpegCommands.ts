import { IpcMainEvent } from 'electron';
import moment from 'moment';
import path from 'path';
import os from 'os';
import fs from 'fs';
import Ffmpeg, { setFfmpegPath } from 'fluent-ffmpeg';
import {
  SplitBlock,
  SplitFixedDetails,
} from '../features/splitter/splitterSlice';

const crypto = require('crypto');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

setFfmpegPath(ffmpegPath);

const progressReportRateMs = 1000;

export function checkVersion(): void {
  console.log(`ffmpegPath: ${ffmpegPath}`);
}

export const getRandomString = (): string => {
  return crypto.randomBytes(4).readUInt32LE(0);
};

export interface FfmpegFluentProgressData {
  frames: number; // 5245,
  currentFps: number; // 41,
  currentKbps: number; // 3635.6,
  targetSize: number; // 77683,
  timemark: string; // '00:02:55.04',
  percent: number; // 0.730807798968402
}

export const splitVideoFileCmd = (
  inputFilePath: string,
  block: SplitBlock
): { cmd: Ffmpeg.FfmpegCommand; clipPath: string } => {
  const clipPath = path.join(
    os.tmpdir(),
    `clip-${getRandomString()}.mp4` // @todo don't assume mp4
  );

  const cmd = Ffmpeg(inputFilePath)
    .setStartTime(block.startSeconds)
    .setDuration(block.durationSeconds)
    .outputOptions('-codec copy')
    .output(clipPath);

  return {
    cmd,
    clipPath,
  };
};

export const concatVideoFilesCmd = (
  filePaths: string[],
  outputPath: string
): { cmd: Ffmpeg.FfmpegCommand; scriptFilePath: string } => {
  const scriptFilePath = path.join(
    os.tmpdir(),
    `list-${getRandomString()}.txt`
  );
  const concatScript = filePaths.map((f) => `file '${f}'`).join('\n');
  fs.writeFileSync(scriptFilePath, concatScript);

  const cmd = Ffmpeg(scriptFilePath)
    .inputOptions(['-f concat', '-safe 0'])
    .outputOptions('-c copy')
    .output(outputPath);

  return {
    cmd,
    scriptFilePath,
  };
};

export const splitVideoFile = (
  inputFilePath: string,
  block: SplitBlock,
  progress?: (data: FfmpegFluentProgressData) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { cmd: genCmd, clipPath } = splitVideoFileCmd(inputFilePath, block);
    let cmd = genCmd.on('end', () => {
      resolve(clipPath);
    });
    if (progress) {
      cmd = cmd.on('progress', progress);
    }
    cmd
      .on('error', (error: any) => {
        reject(error);
      })
      .run();
  });
};

export const concatVideoFiles = (
  filePaths: string[],
  outputPath: string,
  progress?: (data: FfmpegFluentProgressData) => void
) => {
  return new Promise((resolve, reject) => {
    const { cmd: genCmd, scriptFilePath } = concatVideoFilesCmd(
      filePaths,
      outputPath
    );
    let cmd = genCmd.on('end', () => {
      resolve(scriptFilePath);
    });

    if (progress) {
      cmd = cmd.on('progress', progress);
    }

    cmd
      .on('error', (error: any) => {
        reject(error);
      })
      .run();
  });
};

export async function splitFixedLength(
  event: IpcMainEvent,
  details: SplitFixedDetails
): Promise<void> {
  let lastProgressSent = moment.now();

  event.reply('split-start', {
    matchKey: details.matchKey,
  });

  const videoParts = await Promise.all(
    details.blocks.map((block) =>
      splitVideoFile(details.inputFile, block, (progress) => {
        const msSinceLastUpdate = moment.now() - lastProgressSent;
        if (msSinceLastUpdate < progressReportRateMs) return;
        lastProgressSent = moment.now();

        event.reply('split-progress', {
          matchKey: details.matchKey,
          percent: progress.percent * 100,
        });
      })
    )
  );

  await concatVideoFiles(videoParts, details.outputFile, (progress) => {
    const msSinceLastUpdate = moment.now() - lastProgressSent;
    if (msSinceLastUpdate < progressReportRateMs) return;
    lastProgressSent = moment.now();

    event.reply('split-progress', {
      matchKey: details.matchKey,
      percent: progress.percent * 100,
    });
  });

  event.reply('split-end', { matchKey: details.matchKey });
}
