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
