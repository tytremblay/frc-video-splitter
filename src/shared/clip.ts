import type { ClipSettings, SplitBlock } from './types';

/**
 * The subset of a Match this module needs: the video-relative start
 * (`fromSeconds`) and end (`toSeconds`) offsets. Kept structural so callers can
 * pass a full SplitterMatch without this module depending on renderer types.
 */
export interface ClipMatch {
  fromSeconds: number;
  toSeconds: number;
}

/**
 * Compute the blocks that make up a Clip for one match.
 *
 * A Clip is a Match block and a Results block (see CONTEXT.md). When dead-air
 * clipping is enabled and the gap between them exceeds the threshold, they stay
 * as two blocks; otherwise they merge into one continuous block.
 */
export function computeClip(match: ClipMatch, settings: ClipSettings): SplitBlock[] {
  const {
    startPaddingSeconds,
    endPaddingSeconds,
    matchLengthSeconds,
    resultsLengthSeconds,
    clipDeadAir,
    deadAirThresholdSeconds,
  } = settings;

  const matchStart = match.fromSeconds - startPaddingSeconds;
  const matchEnd = match.fromSeconds + matchLengthSeconds + endPaddingSeconds;
  const resultsStart = match.toSeconds - startPaddingSeconds;
  const resultsEnd = match.toSeconds + resultsLengthSeconds + endPaddingSeconds;

  const gap = resultsStart - matchEnd;

  if (clipDeadAir && gap > deadAirThresholdSeconds) {
    return [
      { startSeconds: matchStart, durationSeconds: matchEnd - matchStart },
      { startSeconds: resultsStart, durationSeconds: resultsEnd - resultsStart },
    ];
  }

  return [{ startSeconds: matchStart, durationSeconds: resultsEnd - matchStart }];
}

/**
 * A match is `warning` when it overlaps the edge of the recording — its clip
 * will be truncated at the video boundary — and `ready` when fully contained.
 */
export function deriveStatus(match: ClipMatch, durationSeconds: number): 'ready' | 'warning' {
  if (match.fromSeconds < 0 || match.toSeconds > durationSeconds) return 'warning';
  return 'ready';
}
