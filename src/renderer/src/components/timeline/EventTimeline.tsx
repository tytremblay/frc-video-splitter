import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useMatches, SplitterMatch } from '../../state/useMatches'
import { useSettings } from '../../state/useSettings'
import { setCurrentSeconds, setVideoTimelineOffset, useVideo } from '../../state/useVideo'
import { cn } from '@/lib/utils'

const DEFAULT_PX_PER_SEC = 0.08
const MIN_PX_PER_SEC = 0.01
const MAX_PX_PER_SEC = 2
const DESCRIPTION_MIN_HEIGHT = 36
const BREAK_COLLAPSED_PX = 40

interface MatchSegment {
  type: 'match'
  match: SplitterMatch
  visualTop: number
  visualHeight: number
}

interface BreakSegment {
  type: 'break'
  startTime: number
  endTime: number
  durationSecs: number
  collapsed: boolean
  visualTop: number
  visualHeight: number
}

type Segment = MatchSegment | BreakSegment

function buildLayout(
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

function timeToVisualY(t: number, segments: Segment[], pxPerSec: number): number | null {
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
function timeToVisualYSnapped(t: number, segments: Segment[], pxPerSec: number): number | null {
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
function visualYToTime(y: number, segments: Segment[], pxPerSec: number): number {
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
function timeToVisualYFull(t: number, segments: Segment[], pxPerSec: number): number {
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

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0 && m > 0) return `${h} hr ${m} min`
  if (h > 0) return `${h} hr`
  return `${m} min`
}

export function EventTimeline() {
  const matches = useMatches(state => state.matches)
  const { collapseBreaks, collapseBreakThresholdMinutes } = useSettings()
  const { durationSeconds, videoTimelineOffsetSecs, currentSeconds } = useVideo()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pxPerSec, setPxPerSec] = useState(DEFAULT_PX_PER_SEC)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startClientY: number; startBarVisualY: number } | null>(null)
  const segmentsRef = useRef<Segment[]>([])
  const pxPerSecRef = useRef(pxPerSec)
  const zoomAnchorRef = useRef<{ time: number; viewportY: number } | null>(null)

  const timedMatches = matches.filter(m => m.actualTime != null && m.postResultTime != null)
  const orphanMatches = matches.filter(m => m.actualTime == null || m.postResultTime == null)

  const sortedTimedMatches = [...timedMatches].sort((a, b) => a.actualTime! - b.actualTime!)
  const thresholdSecs = collapseBreakThresholdMinutes * 60

  const { segments, totalHeight } = buildLayout(sortedTimedMatches, pxPerSec, collapseBreaks, thresholdSecs)

  segmentsRef.current = segments
  pxPerSecRef.current = pxPerSec

  const timelineStart = sortedTimedMatches.length > 0 ? sortedTimedMatches[0].actualTime! : 0
  const timelineEnd = sortedTimedMatches.length > 0
    ? sortedTimedMatches[sortedTimedMatches.length - 1].postResultTime!
    : 0

  // Initialize video offset to timeline start when video is first loaded
  useEffect(() => {
    if (videoTimelineOffsetSecs === null && durationSeconds > 0 && timelineStart > 0) {
      setVideoTimelineOffset(timelineStart)
    }
  }, [videoTimelineOffsetSecs, durationSeconds, timelineStart])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const isMac = navigator.platform.toUpperCase().includes('MAC')
    const handleWheel = (e: WheelEvent) => {
      if (isMac ? e.metaKey : e.ctrlKey) {
        e.preventDefault()
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        const rect = el.getBoundingClientRect()
        const viewportY = e.clientY - rect.top
        const contentY = viewportY + el.scrollTop
        const anchorTime = visualYToTime(contentY, segmentsRef.current, pxPerSecRef.current)
        zoomAnchorRef.current = { time: anchorTime, viewportY }
        setPxPerSec(prev => Math.min(MAX_PX_PER_SEC, Math.max(MIN_PX_PER_SEC, prev * factor)))
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  useLayoutEffect(() => {
    const anchor = zoomAnchorRef.current
    const el = containerRef.current
    if (!anchor || !el) return
    zoomAnchorRef.current = null
    const newContentY = timeToVisualYFull(anchor.time, segments, pxPerSec)
    el.scrollTop = newContentY - anchor.viewportY
  }, [pxPerSec])

  function handleMatchClick(match: SplitterMatch) {
    setSelectedId(match.id)
    if (match.fromSeconds != null) {
      setCurrentSeconds(match.fromSeconds)
    }
  }

  const handleBarPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const currentOffset = videoTimelineOffsetSecs ?? timelineStart
    dragRef.current = {
      startClientY: e.clientY,
      startBarVisualY: timeToVisualYFull(currentOffset, segments, pxPerSec),
    }
  }, [videoTimelineOffsetSecs, timelineStart, segments, pxPerSec])

  const handleBarPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const deltaY = e.clientY - dragRef.current.startClientY
    const newBarVisualY = dragRef.current.startBarVisualY + deltaY
    setVideoTimelineOffset(visualYToTime(newBarVisualY, segments, pxPerSec))
  }, [segments, pxPerSec])

  const handleBarPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  if (matches.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/30 p-8 text-center">
        <div className="size-8 rounded-full border border-border/40 flex items-center justify-center">
          <svg className="size-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">No matches yet</p>
          <p className="max-w-xs text-xs text-muted-foreground/50 leading-relaxed">
            Link an event from TBA or add matches manually to see the timeline.
          </p>
        </div>
      </div>
    )
  }

  const firstHour = Math.ceil(timelineStart / 3600) * 3600
  const hourMarkers: number[] = []
  for (let t = firstHour; t <= timelineEnd; t += 3600) hourMarkers.push(t)

  const dayBoundaries: { time: number; label: string }[] = []
  if (sortedTimedMatches.length > 0) {
    const startDate = new Date(timelineStart * 1000)
    const cursor = new Date(startDate)
    cursor.setHours(24, 0, 0, 0)
    while (cursor.getTime() / 1000 <= timelineEnd) {
      const t = cursor.getTime() / 1000
      dayBoundaries.push({
        time: t,
        label: cursor.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      })
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  // Video bar geometry
  const showVideoBar = durationSeconds > 0 && videoTimelineOffsetSecs !== null && segments.length > 0
  const coveredIds = new Set(
    showVideoBar
      ? sortedTimedMatches
          .filter(m => m.actualTime! < videoTimelineOffsetSecs! + durationSeconds && m.postResultTime! > videoTimelineOffsetSecs!)
          .map(m => m.id)
      : []
  )

  let barTop = 0
  let barHeight = 0
  if (showVideoBar) {
    barTop = timeToVisualYFull(videoTimelineOffsetSecs!, segments, pxPerSec)
    const barBottom = timeToVisualYFull(videoTimelineOffsetSecs! + durationSeconds, segments, pxPerSec)
    barHeight = barBottom - barTop
  }

  const showPlayhead = showVideoBar
  const playheadY = showPlayhead
    ? timeToVisualYFull(videoTimelineOffsetSecs! + currentSeconds, segments, pxPerSec)
    : null

  return (
    <div ref={containerRef} className="overflow-y-auto h-full select-none">
      <div className="px-3 pb-8 pt-3 flex flex-col gap-0">

        {sortedTimedMatches.length > 0 && (
          <div className="relative w-full flex gap-2" style={{ height: totalHeight }}>
            {/* Hour markers column */}
            <div className="relative shrink-0 w-14">
              {hourMarkers.map(t => {
                const y = timeToVisualYFull(t, segments, pxPerSec)
                const label = new Date(t * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                return (
                  <div
                    key={t}
                    className="absolute right-0 flex items-center gap-1.5 -translate-y-1/2"
                    style={{ top: y }}
                  >
                    <span className="text-[9px] font-mono text-muted-foreground/40 whitespace-nowrap leading-none tracking-tight">
                      {label}
                    </span>
                    <div className="w-1.5 h-px bg-border/40" />
                  </div>
                )
              })}
            </div>

            {/* Video bar column */}
            <div className="relative shrink-0 w-2">
              {/* Vertical track line */}
              <div className="absolute inset-x-0 top-0 bottom-0 flex justify-center">
                <div className="w-px bg-border/20 h-full" />
              </div>
              {showVideoBar && (
                <div
                  className="absolute inset-x-0 pointer-events-none"
                  style={{ top: barTop, height: Math.max(barHeight, 8) }}
                >
                  <div className="absolute inset-0 rounded-sm"
                    style={{ background: 'oklch(0.6 0.15 220 / 0.15)', borderLeft: '2px solid oklch(0.65 0.18 220 / 0.7)', borderRight: '2px solid oklch(0.65 0.18 220 / 0.3)' }}
                  />

                  {/* Top drag handle */}
                  <div
                    className="absolute top-0 inset-x-[-3px] h-5 pointer-events-auto cursor-grab active:cursor-grabbing z-30 flex flex-col items-center gap-0.5 pt-0.5"
                    onPointerDown={handleBarPointerDown}
                    onPointerMove={handleBarPointerMove}
                    onPointerUp={handleBarPointerUp}
                  >
                    <div className="w-full h-0.5 rounded-full" style={{ background: 'oklch(0.65 0.18 220 / 0.9)' }} />
                  </div>

                  {/* Bottom edge */}
                  <div className="absolute bottom-0 inset-x-[-3px] h-px rounded-full" style={{ background: 'oklch(0.65 0.18 220 / 0.5)' }} />
                </div>
              )}
            </div>

            {/* Tick lines + match blocks */}
            <div className="relative flex-1 min-w-0">
              {/* Hour tick lines */}
              {hourMarkers.map(t => {
                const y = timeToVisualYFull(t, segments, pxPerSec)
                return (
                  <div
                    key={t}
                    className="absolute left-0 right-0 h-px"
                    style={{ top: y, background: 'oklch(1 0 0 / 0.04)' }}
                  />
                )
              })}

              {/* Day boundary lines */}
              {dayBoundaries.map(({ time, label }) => {
                const y = timeToVisualYSnapped(time, segments, pxPerSec)
                if (y === null) return null
                return (
                  <div
                    key={time}
                    className="absolute left-0 right-0 flex items-center gap-2 z-10 -translate-y-1/2"
                    style={{ top: y }}
                  >
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
                      style={{ background: 'oklch(0.175 0.009 258)', color: 'oklch(0.55 0.022 258)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                )
              })}

              {/* Break indicators */}
              {segments.filter((s): s is BreakSegment => s.type === 'break' && s.collapsed).map((seg, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 flex items-center gap-2"
                  style={{ top: seg.visualTop, height: seg.visualHeight }}
                >
                  <div className="flex-1 h-px" style={{ backgroundImage: 'repeating-linear-gradient(90deg, oklch(1 0 0 / 0.12) 0px, oklch(1 0 0 / 0.12) 3px, transparent 3px, transparent 7px)' }} />
                  <span className="shrink-0 text-[9px] font-mono tracking-tight tabular-nums" style={{ color: 'oklch(0.45 0.015 258)' }}>
                    {formatDuration(seg.durationSecs)}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundImage: 'repeating-linear-gradient(90deg, oklch(1 0 0 / 0.12) 0px, oklch(1 0 0 / 0.12) 3px, transparent 3px, transparent 7px)' }} />
                </div>
              ))}

              {/* Playhead */}
              {playheadY !== null && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: playheadY }}
                >
                  <div className="absolute left-0 right-0 h-px" style={{ background: 'oklch(0.75 0.18 35 / 0.9)' }} />
                  <div className="absolute left-0 right-0 h-px translate-y-[1px] blur-sm" style={{ background: 'oklch(0.75 0.18 35 / 0.5)' }} />
                </div>
              )}

              {/* Match blocks */}
              {segments.filter((s): s is MatchSegment => s.type === 'match').map(({ match, visualTop, visualHeight }) => {
                const isSelected = match.id === selectedId
                const isCovered = coveredIds.has(match.id)
                const showDescription = visualHeight >= DESCRIPTION_MIN_HEIGHT
                return (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => handleMatchClick(match)}
                    className={cn(
                      'absolute left-0 right-0 overflow-hidden text-left transition-all duration-100 group',
                      'rounded-sm border-l-2',
                      isSelected
                        ? 'border-l-[var(--primary)]'
                        : isCovered
                          ? 'border-l-[oklch(0.62_0.18_220)]'
                          : 'border-l-border/40 hover:border-l-border'
                    )}
                    style={{
                      top: visualTop,
                      height: visualHeight,
                      paddingLeft: '0.5rem',
                      paddingRight: '0.375rem',
                      paddingTop: visualHeight < 12 ? 0 : '0.2rem',
                      background: isSelected
                        ? 'oklch(0.71 0.168 61 / 0.18)'
                        : isCovered
                          ? 'oklch(0.62 0.18 220 / 0.1)'
                          : 'oklch(0.14 0.009 258 / 0.7)',
                      boxShadow: isSelected
                        ? 'inset 0 0 0 1px oklch(0.71 0.168 61 / 0.3)'
                        : isCovered
                          ? 'inset 0 0 0 1px oklch(0.62 0.18 220 / 0.2)'
                          : 'inset 0 0 0 1px oklch(1 0 0 / 0.05)',
                    }}
                  >
                    <span className={cn(
                      'block text-[11px] font-semibold leading-tight truncate',
                      visualHeight < 14 && 'sr-only',
                      isSelected ? 'text-primary' : isCovered ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {match.name}
                    </span>
                    {showDescription && (
                      <span className="block text-[10px] leading-tight truncate mt-px"
                        style={{ color: isSelected ? 'oklch(0.71 0.168 61 / 0.7)' : 'oklch(0.5 0.015 258)' }}>
                        {match.description}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {orphanMatches.length > 0 && (
          <div className="flex flex-col gap-1 mt-6">
            <p className="text-[9px] font-semibold uppercase tracking-widest mb-2 px-1"
              style={{ color: 'oklch(0.42 0.015 258)' }}>
              No timing data
            </p>
            {orphanMatches.map(match => {
              const isSelected = match.id === selectedId
              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => handleMatchClick(match)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded-sm border-l-2 transition-all duration-100 group',
                    isSelected
                      ? 'border-l-[var(--primary)]'
                      : 'border-l-border/30 hover:border-l-border/60'
                  )}
                  style={{
                    background: isSelected
                      ? 'oklch(0.71 0.168 61 / 0.12)'
                      : 'oklch(0.14 0.009 258 / 0.5)',
                    boxShadow: isSelected
                      ? 'inset 0 0 0 1px oklch(0.71 0.168 61 / 0.2)'
                      : 'inset 0 0 0 1px oklch(1 0 0 / 0.04)',
                  }}
                >
                  <span className={cn(
                    'block text-[11px] font-semibold leading-tight truncate',
                    isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}>
                    {match.name}
                  </span>
                  {match.description && (
                    <span className="block text-[10px] leading-tight truncate mt-px"
                      style={{ color: 'oklch(0.45 0.015 258)' }}>
                      {match.description}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
