import type { SplitFixedDetails } from './types'

export enum IpcChannel {
  OpenFile = 'dialog:openFile',
  OpenDirectory = 'dialog:openDirectory',
  SplitStart = 'split:start',
  SplitProgress = 'split:progress',
  SplitEnd = 'split:end'
}

export interface IpcApi {
  openFile: () => Promise<string | undefined>
  openDirectory: () => Promise<string | undefined>
  splitMatches: (details: SplitFixedDetails[]) => Promise<void>
  onSplitStart: (callback: (payload: { matchKey: string }) => void) => () => void
  onSplitProgress: (callback: (payload: { matchKey: string; percent: number }) => void) => () => void
  onSplitEnd: (callback: (payload: { matchKey: string }) => void) => () => void
}
