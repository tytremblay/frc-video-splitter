import { describe, expect, it } from 'vitest';
import { computeClip, deriveStatus } from './clip';
import type { ClipSettings } from './types';

const settings: ClipSettings = {
  startPaddingSeconds: 3,
  endPaddingSeconds: 10,
  matchLengthSeconds: 150,
  resultsLengthSeconds: 10,
  clipDeadAir: false,
  deadAirThresholdSeconds: 30,
};

describe('computeClip', () => {
  it('produces one continuous block when dead-air clipping is off', () => {
    // match block: [100-3, 100+150+10] = [97, 260]
    // results block: [400-3, 400+10+10] = [397, 420]
    const blocks = computeClip({ fromSeconds: 100, toSeconds: 400 }, settings);
    expect(blocks).toEqual([{ startSeconds: 97, durationSeconds: 420 - 97 }]);
  });

  it('splits into two blocks when the gap exceeds the threshold', () => {
    // matchEnd = 260, resultsStart = 397 -> gap 137 > 30
    const blocks = computeClip(
      { fromSeconds: 100, toSeconds: 400 },
      { ...settings, clipDeadAir: true }
    );
    expect(blocks).toEqual([
      { startSeconds: 97, durationSeconds: 260 - 97 },
      { startSeconds: 397, durationSeconds: 420 - 397 },
    ]);
  });

  it('keeps one block when the gap is at or below the threshold, even with clipping on', () => {
    // Choose toSeconds so gap == threshold exactly.
    // matchEnd = 100+150+10 = 260; resultsStart = toSeconds-3.
    // gap = (toSeconds-3) - 260 = 30  =>  toSeconds = 293
    const boundary = computeClip(
      { fromSeconds: 100, toSeconds: 293 },
      { ...settings, clipDeadAir: true }
    );
    expect(boundary).toHaveLength(1); // gap == threshold is not > threshold

    // One second more of gap tips it into two blocks.
    const justOver = computeClip(
      { fromSeconds: 100, toSeconds: 294 },
      { ...settings, clipDeadAir: true }
    );
    expect(justOver).toHaveLength(2);
  });
});

describe('deriveStatus', () => {
  it('is ready when the match is fully within the recording', () => {
    expect(deriveStatus({ fromSeconds: 10, toSeconds: 200 }, 600)).toBe('ready');
  });

  it('warns when the match starts before the recording', () => {
    expect(deriveStatus({ fromSeconds: -1, toSeconds: 200 }, 600)).toBe('warning');
  });

  it('warns when the match ends after the recording', () => {
    expect(deriveStatus({ fromSeconds: 10, toSeconds: 700 }, 600)).toBe('warning');
  });
});
