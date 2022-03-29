import {
  buildComplexFilter,
  concatVideoFilesCmd,
  getRandomString,
  splitVideoFileCmd,
} from '../app/ffmpeg/ffmpegCommands';

const fs = require('fs');
const os = require('os');

const path = require('path');

describe('Video Split Component', () => {
  it('test buildComplexFilter', () => {
    const blocks = [
      { startSeconds: 60, durationSeconds: 5 },
      { startSeconds: 120, durationSeconds: 5 },
    ];
    const filter = buildComplexFilter(blocks);

    expect(filter).toMatchSnapshot();
    console.log('filter', filter);
  });

  it('reduces duration', () => {
    const blocks = [
      { startSeconds: 60, durationSeconds: 5 },
      { startSeconds: 120, durationSeconds: 5 },
    ];

    const totalTime = blocks
      .map((b) => b.durationSeconds)
      .reduce((prev, cur) => prev + cur, 0);
    expect(totalTime).toEqual(
      blocks[0].durationSeconds + blocks[1].durationSeconds
    );
  });

  // it('split two clips and concat', async () => {
  //   const inputFile = 'test.mp4';
  //   // ffmpeg -ss 60 -i input -t 5 -codec copy clip1.mkv
  //   const clip1Path = await splitVideoFile(inputFile, {
  //     startSeconds: 30,
  //     durationSeconds: 30,
  //   });
  //   // ffmpeg -ss 120 -i input -t 5 -codec copy clip2.mkv
  //   const clip2Path = await splitVideoFile(inputFile, {
  //     startSeconds: 30,
  //     durationSeconds: 30,
  //   });
  //   // $ echo "file 'clip1.mkv'" > concat.txt
  //   // $ echo "file 'clip2.mkv'" >> concat.txt
  //   // $ ffmpeg -f concat -i concat.txt -codec copy output.mkv
  //   await concatVideoFiles([clip1Path, clip2Path], 'output.mp4');
  // });

  it('generate unique string', () => {
    const a = getRandomString();
    const b = getRandomString();
    expect(a).not.toEqual(b);
  });

  it('builds ffmpeg split command', () => {
    const { cmd, clipPath } = splitVideoFileCmd('test.mp4', {
      startSeconds: 30,
      durationSeconds: 60,
    });
    const cmdStr = cmd._getArguments().join(' ');
    const expectedCmd = '-ss 30 -i test.mp4 -y -t 60 -codec copy';
    expect(cmdStr.startsWith(expectedCmd)).toBeTruthy();
    expect(cmdStr.endsWith(clipPath)).toBeTruthy();
  });

  it('builds ffmpeg concat command', () => {
    const { cmd, scriptFilePath } = concatVideoFilesCmd(
      ['test1.mp4', 'test2.mp4'],
      'output.mp4'
    );
    const expectedCmd = `-f concat -safe 0 -i ${scriptFilePath} -y -c copy output.mp4`;
    const cmdStr = cmd._getArguments().join(' ');
    expect(cmdStr).toEqual(expectedCmd);
    // console.log(cmdStr);
    // console.log(scriptFilePath);
  });
});
