import { useRef, useState, useEffect, useLayoutEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useMatches } from '../../state/useMatches'
import { useSettings } from '../../state/useSettings'
import { setVideoTimelineOffset, useVideo } from '../../state/useVideo'
import { buildLayout, formatDuration, timeToVisualYFull, timeToVisualYSnapped, visualYToTime } from './layout'
import { BreakSegment, DEFAULT_PX_PER_SEC, MatchSegment, MAX_PX_PER_SEC, MIN_PX_PER_SEC, Segment } from './types'
import { MatchBlock } from './MatchBlock'
import { VideoBar } from './VideoBar'
import { OrphanMatchList } from './OrphanMatchList'

export interface EventTimelineHandle {
  zoomIn: () => void
  zoomOut: () => void
}

export const EventTimeline = forwardRef<EventTimelineHandle>(function EventTimeline(_, ref) {
  const matches = useMatches(state => state.matches)
  const { collapseBreaks, collapseBreakThresholdMinutes } = useSettings()
  const { durationSeconds, videoTimelineOffsetSecs, currentSeconds, path } = useVideo()
  const fileName = path.split(/[/\\]/).pop() ?? path
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pxPerSec, setPxPerSec] = useState(DEFAULT_PX_PER_SEC)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startClientY: number; startBarVisualY: number } | null>(null)
  const segmentsRef = useRef<Segment[]>([])
  const pxPerSecRef = useRef(pxPerSec)
  const zoomAnchorRef = useRef<{ time: number; viewportY: number } | null>(null)

  const applyZoom = useCallback((factor: number) => {
    const el = containerRef.current
    if (el) {
      const viewportY = el.clientHeight / 2
      const contentY = viewportY + el.scrollTop
      const anchorTime = visualYToTime(contentY, segmentsRef.current, pxPerSecRef.current)
      zoomAnchorRef.current = { time: anchorTime, viewportY }
    }
    setPxPerSec(prev => Math.min(MAX_PX_PER_SEC, Math.max(MIN_PX_PER_SEC, prev * factor)))
  }, [])

  useImperativeHandle(ref, () => ({
    zoomIn: () => applyZoom(1.3),
    zoomOut: () => applyZoom(0.7),
  }), [applyZoom])

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
          <svg className="size-4 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground/85 uppercase">No matches yet</p>
          <p className="max-w-xs text-xs text-muted-foreground/75 leading-relaxed">
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

  const playheadY = showVideoBar
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
                    <span className="text-[9px] font-mono text-muted-foreground/55 whitespace-nowrap leading-none tracking-tight">
                      {label}
                    </span>
                    <div className="w-1.5 h-px bg-border/40" />
                  </div>
                )
              })}
            </div>

            <VideoBar
              show={showVideoBar}
              top={barTop}
              height={barHeight}
              fileName={fileName}
              onPointerDown={handleBarPointerDown}
              onPointerMove={handleBarPointerMove}
              onPointerUp={handleBarPointerUp}
            />

            {/* Tick lines + match blocks */}
            <div className="relative flex-1 min-w-0">
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

              {playheadY !== null && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: playheadY }}
                >
                  <div className="absolute left-0 right-0 h-px" style={{ background: 'oklch(0.75 0.18 35 / 0.9)' }} />
                  <div className="absolute left-0 right-0 h-px translate-y-[1px] blur-sm" style={{ background: 'oklch(0.75 0.18 35 / 0.5)' }} />
                </div>
              )}

              {segments.filter((s): s is MatchSegment => s.type === 'match').map(({ match, visualTop, visualHeight }) => (
                <MatchBlock
                  key={match.id}
                  match={match}
                  visualTop={visualTop}
                  visualHeight={visualHeight}
                  isSelected={match.id === selectedId}
                  isCovered={coveredIds.has(match.id)}
                  onClick={() => setSelectedId(match.id)}
                />
              ))}
            </div>
          </div>
        )}

        <OrphanMatchList
          matches={orphanMatches}
          selectedId={selectedId}
          onMatchClick={match => setSelectedId(match.id)}
        />
      </div>
    </div>
  )
})
