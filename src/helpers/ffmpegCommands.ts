import { IpcMainInvokeEvent } from 'electron';
import Ffmpeg, { setFfmpegPath } from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

export interface SplitBlock {
  startSeconds: number;
  durationSeconds: number;
}

export interface SplitFixedDetails {
  id: string;
  inputFile: string;
  outputFile: string;
  blocks: SplitBlock[];
}

const ffmpegPath = ffmpegInstaller.path.replace(
  'app.asar',
  'app.asar.unpacked'
);

setFfmpegPath(ffmpegPath);

const progressReportRateMs = 1000;

export function checkVersion(): void {
  console.log(`ffmpegPath: ${ffmpegPath}`);
}

export const getRandomString = (): string => {
  return uuid();
};

export interface FfmpegFluentProgressData {
  frames: number; // 5245,
  currentFps: number; // 41,
  currentKbps: number; // 3635.6,
  targetSize: number; // 77683,
  timemark: string; // '00:02:55.04',
}

export const splitVideoFileCmd = (
  inputFilePath: string,
  block: SplitBlock
): { cmd: Ffmpeg.FfmpegCommand; clipPath: string } => {
  const extension = path.extname(inputFilePath);
  const clipPath = path.join(
    os.tmpdir(),
    `clip-${getRandomString()}.${extension}` // @todo don't assume mp4
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
  event: IpcMainInvokeEvent,
  details: SplitFixedDetails
): Promise<void> {
  let lastProgressSent = Date.now();
  let reportsSent = 0;

  event.sender.send('split-start', {
    id: details.id,
  });

  const videoParts = await Promise.all(
    details.blocks.map((block) =>
      splitVideoFile(details.inputFile, block, (progress) => {
        const msSinceLastUpdate = Date.now() - lastProgressSent;
        if (msSinceLastUpdate < progressReportRateMs && reportsSent > 0) return;
        lastProgressSent = Date.now();

        event.sender.send('split-progress', {
          id: details.id,
          percent: 100,
        });
        reportsSent++;
      })
    )
  );

  await concatVideoFiles(videoParts, details.outputFile, (progress) => {
    const msSinceLastUpdate = Date.now() - lastProgressSent;
    if (msSinceLastUpdate < progressReportRateMs) return;
    lastProgressSent = Date.now();

    event.sender.send('split-progress', {
      id: details.id,
      percent: 100,
    });
  });

  event.sender.send('split-end', { matchKey: details.id });
}
