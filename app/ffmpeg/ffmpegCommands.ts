import FfmpegCommand, { setFfmpegPath } from 'fluent-ffmpeg';
import { IpcMainEvent } from 'electron';
import moment from 'moment';
import { SplitDetails } from '../features/splitter/splitterSlice';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

setFfmpegPath(ffmpegPath);

const progressReportRateMs = 1000;

export function checkVersion(): void {
  console.log(`ffmpegPath: ${ffmpegPath}`);
}

export async function split(
  event: IpcMainEvent,
  details: SplitDetails
): Promise<null> {
  let lastProgressSent = moment.now();

  return new Promise((resolve, reject) => {
    FfmpegCommand(details.inputFile)
      .on('start', (ffmpegCommand) => {
        event.reply('split-start', {
          matchKey: details.matchKey,
          ffmpegCommand,
        });
      })
      .on('progress', (data) => {
        const msSinceLastUpdate = moment.now() - lastProgressSent;
        if (msSinceLastUpdate < progressReportRateMs) return;

        const currentSeconds = moment.duration(data.timemark).asSeconds();
        const totalSeconds = details.durationSeconds;

        event.reply('split-progress', {
          matchKey: details.matchKey,
          percent: (currentSeconds / totalSeconds) * 100,
        });
        lastProgressSent = moment.now();
      })
      .on('end', () => {
        event.reply('split-end', { matchKey: details.matchKey });
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      })
      .addInputOption(`-ss ${details.startSeconds}`)
      .addOutputOptions([
        `-t ${details.durationSeconds}`,
        `-threads 3`,
        '-vcodec copy',
        '-acodec copy',
      ])
      .output(`${details.outputFile}`)
      .run();
  });
}
