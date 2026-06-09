import { SplitterMatch } from '../../state/useMatches'
import { BreakSegment, BREAK_COLLAPSED_PX, MatchSegment, Segment } from './types'

export function buildLayout(
  sortedMatches: SplitterMatch[],
  pxPerSec: number,
  collapseBreaks: boolean,
  thresholdSecs: number
): { segments: Segment[]; totalHeight: number } {
  const segments: Segment[] = []
  let cursor = 0

  for (let i = 0; i < sortedMatches.length; i++) {
    const m = sortedMatches[i]

    if (i > 0) {
      const prev = sortedMatches[i - 1]
      const gap = m.actualTime! - prev.postResultTime!
      if (gap > 0) {
        const collapsed = collapseBreaks && gap > thresholdSecs
        const visualHeight = collapsed ? BREAK_COLLAPSED_PX : gap * pxPerSec
        segments.push({
          type: 'break',
          startTime: prev.postResultTime!,
          endTime: m.actualTime!,
          durationSecs: gap,
          collapsed,
          visualTop: cursor,
          visualHeight,
        })
        cursor += visualHeight
      }
    }

    const visualHeight = Math.max(4, (m.postResultTime! - m.actualTime!) * pxPerSec)
    segments.push({ type: 'match', match: m, visualTop: cursor, visualHeight })
    cursor += visualHeight
  }

  return { segments, totalHeight: cursor }
}

export function timeToVisualY(t: number, segments: Segment[], pxPerSec: number): number | null {
  for (const seg of segments) {
    if (seg.type === 'match') {
      const m = seg.match
      if (t >= m.actualTime! && t <= m.postResultTime!) {
        return seg.visualTop + (t - m.actualTime!) * pxPerSec
      }
    } else {
      if (t >= seg.startTime && t <= seg.endTime) {
        if (seg.collapsed) return null
        return seg.visualTop + (t - seg.startTime) * pxPerSec
      }
    }
  }
  return null
}

// Snaps times inside collapsed breaks to the break's midpoint.
export function timeToVisualYSnapped(t: number, segments: Segment[], pxPerSec: number): number | null {
  const y = timeToVisualY(t, segments, pxPerSec)
  if (y !== null) return y
  for (const seg of segments) {
    if (seg.type === 'break' && seg.collapsed && t >= seg.startTime && t <= seg.endTime) {
      return seg.visualTop + seg.visualHeight / 2
    }
  }
  return null
}

// Inverse of timeToVisualYFull: maps a visual Y back to a timeline time.
export function visualYToTime(y: number, segments: Segment[], pxPerSec: number): number {
  if (segments.length === 0) return 0

  for (const seg of segments) {
    if (y >= seg.visualTop && y < seg.visualTop + seg.visualHeight) {
      const localY = y - seg.visualTop
      if (seg.type === 'match') {
        return seg.match.actualTime! + localY / pxPerSec
      } else {
        return seg.collapsed
          ? seg.startTime + (localY / seg.visualHeight) * seg.durationSecs
          : seg.startTime + localY / pxPerSec
      }
    }
  }

  const first = segments[0]
  const firstTime = first.type === 'match' ? first.match.actualTime! : (first as BreakSegment).startTime
  if (y < first.visualTop) return firstTime - (first.visualTop - y) / pxPerSec

  const last = segments[segments.length - 1]
  const lastEndTime = last.type === 'match' ? last.match.postResultTime! : (last as BreakSegment).endTime
  return lastEndTime + (y - (last.visualTop + last.visualHeight)) / pxPerSec
}

// Maps any time (including outside the timeline range) to a visual Y.
export function timeToVisualYFull(t: number, segments: Segment[], pxPerSec: number): number {
  if (segments.length === 0) return 0
  const y = timeToVisualYSnapped(t, segments, pxPerSec)
  if (y !== null) return y
  const first = segments[0]
  const firstTime = first.type === 'match' ? first.match.actualTime! : (first as BreakSegment).startTime
  if (t < firstTime) return first.visualTop - (firstTime - t) * pxPerSec
  const last = segments[segments.length - 1]
  const lastEndTime = last.type === 'match' ? last.match.postResultTime! : (last as BreakSegment).endTime
  return last.visualTop + last.visualHeight + (t - lastEndTime) * pxPerSec
}

export function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0 && m > 0) return `${h} hr ${m} min`
  if (h > 0) return `${h} hr`
  return `${m} min`
}
