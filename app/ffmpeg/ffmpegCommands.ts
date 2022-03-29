import FfmpegCommand, { setFfmpegPath } from 'fluent-ffmpeg';
import { IpcMainEvent } from 'electron';
import moment from 'moment';
import { SplitBlock, SplitDetails, SplitFixedDetails } from "../features/splitter/splitterSlice";

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

setFfmpegPath(ffmpegPath);

const progressReportRateMs = 1000;

export function checkVersion(): void {
  console.log(`ffmpegPath: ${ffmpegPath}`);
}

export const buildComplexFilter = (blocks: SplitBlock[]): string[] => {
  const out: string[] = [];
  let concat = '';
  for (let idx = 0; idx < blocks.length; idx += 1) {
    const blk = blocks[idx];
    out.push(`[0:v]trim=${blk.startSeconds}:${blk.startSeconds+blk.durationSeconds},setpts=PTS-STARTPTS[v${idx}]`);
	  out.push(`[0:a]atrim=${blk.startSeconds}:${blk.startSeconds+blk.durationSeconds},asetpts=PTS-STARTPTS[a${idx}]`);
    concat += `[v${idx}][a${idx}]`;
  }
  out.push(`${concat}concat=n=${blocks.length}:v=1:a=1[out]`);
  return out;
};

interface FfmpegFluentProgressData {
  frames: number; // 5245,
  currentFps: number; // 41,
  currentKbps: number; // 3635.6,
  targetSize: number; // 77683,
  timemark: string; // '00:02:55.04',
  percent: number; // 0.730807798968402
}

export async function splitFixedLength(
  event: IpcMainEvent,
  details: SplitFixedDetails
): Promise<null> {
  let lastProgressSent = moment.now();

  return new Promise((resolve, reject) => {
    FfmpegCommand(details.inputFile)
      .on('start', (ffmpegCommand) => {
        console.log(`Command is : ${ffmpegCommand}`);
        event.reply('split-start', {
          matchKey: details.matchKey,
          ffmpegCommand,
        });
      })
      .on('progress', (data: FfmpegFluentProgressData) => {
        const msSinceLastUpdate = moment.now() - lastProgressSent;
        if (msSinceLastUpdate < progressReportRateMs) return;
        console.log(data);

        event.reply('split-progress', {
          matchKey: details.matchKey,
          percent: data.percent * 100,
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
      .complexFilter(buildComplexFilter(details.blocks))
      .outputOptions([
        '-map [out]',
        // '-threads 3',
        // '-vcodec copy',
        // '-acodec copy',
      ])
      .output(`${details.outputFile}`)
      .run();
  });
}
