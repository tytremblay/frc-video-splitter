export type ConcurrencyLevel = 'efficient' | 'normal' | 'performance' | 'extreme'

export interface SplitBlock {
  startSeconds: number;
  durationSeconds: number;
}

export interface SplitFixedDetails {
  matchKey: string;
  inputFile: string;
  outputFile: string;
  blocks: SplitBlock[];
}

/**
 * The timing fields that govern how a Clip's blocks are computed. A structural
 * subset of the settings store, so the Clip module never names the store.
 */
export interface ClipSettings {
  startPaddingSeconds: number;
  endPaddingSeconds: number;
  matchLengthSeconds: number;
  resultsLengthSeconds: number;
  clipDeadAir: boolean;
  deadAirThresholdSeconds: number;
}

/**
 * A per-match lifecycle event emitted by the ffmpeg orchestrator. The Electron
 * adapter (main/ipc.ts) is what turns these into IPC sends; the orchestrator
 * itself knows nothing about the transport.
 */
export type SplitEvent =
  | { type: 'start'; matchKey: string }
  | { type: 'progress'; matchKey: string; percent: number }
  | { type: 'end'; matchKey: string };
