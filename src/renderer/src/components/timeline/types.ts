import { SplitterMatch } from '../../state/useMatches'

export const DEFAULT_PX_PER_SEC = 0.08
export const MIN_PX_PER_SEC = 0.01
export const MAX_PX_PER_SEC = 2
export const DESCRIPTION_MIN_HEIGHT = 36
export const BREAK_COLLAPSED_PX = 40

export interface MatchSegment {
  type: 'match'
  match: SplitterMatch
  visualTop: number
  visualHeight: number
}

export interface BreakSegment {
  type: 'break'
  startTime: number
  endTime: number
  durationSecs: number
  collapsed: boolean
  visualTop: number
  visualHeight: number
}

export type Segment = MatchSegment | BreakSegment
