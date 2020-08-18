import FfmpegCommand, { setFfmpegPath } from 'fluent-ffmpeg';
import { IpcMainEvent } from 'electron';
import moment from 'moment';
import { SplitDetails } from '../features/splitter/splitterSlice';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

setFfmpegPath(ffmpegPath);

const progressReportRateMs = 2000;

export function checkVersion(): void {
  console.log(`ffmpegPath: ${ffmpegPath}`);
}

export async function split(event: IpcMainEvent, details: SplitDetails) {
  let lastProgressSent = moment.now();

  FfmpegCommand(details.inputFile)
    .on('start', (ffmpegCommand) => {
      event.reply('split-start', {
        matchKey: details.matchKey,
        ffmpegCommand,
      });
      /// log something maybe
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
      /// encoding is complete, so callback or move on at this point
    })
    .on('error', (error) => {
      console.log(`slitting error`, error);
      /// error handling
    })
    .addInputOption(`-ss ${details.startSeconds}`)
    .addOutputOption([`-t ${details.durationSeconds}`])
    .addOutputOption([`-threads 1`])
    .output(`${details.outputFile}`)
    .run();
}
