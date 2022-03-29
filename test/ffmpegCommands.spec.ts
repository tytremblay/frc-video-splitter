import asyncPool from 'tiny-async-pool';
import {
  concatVideoFilesCmd,
  getRandomString,
  splitVideoFileCmd,
} from '../app/ffmpeg/ffmpegCommands';

describe('Video Split Component', () => {
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

  it('runs limited number of promises together', async () => {
    console.log('Here');
    async function workToDo(): Promise<void> {
      console.log('Doing Work');
    }
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for await (const datum of asyncPool(4, data, workToDo)) {
      console.log('here?', datum);
    }
  });
});
