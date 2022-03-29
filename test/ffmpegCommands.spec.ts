import { buildComplexFilter } from '../app/ffmpeg/ffmpegCommands';

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

    console.log(blocks.map(b=>b.durationSeconds).reduce((prev, cur)=>prev+cur, 0))
  })
});
