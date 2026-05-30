import { useCallback, useEffect, useRef, useState } from 'react'
import type { SplitFixedDetails } from '@shared/types'

export type MatchSplitStatus = 'ready' | 'warning' | 'splitting' | 'split'

export function useSplitOperation() {
  const [statusMap, setStatusMap] = useState<Map<string, MatchSplitStatus>>(new Map())
  const [progressMap, setProgressMap] = useState<Map<string, number>>(new Map())
  const [outputFileMap, setOutputFileMap] = useState<Map<string, string>>(new Map())
  const unsubscribeRefs = useRef<Array<() => void>>([])

  useEffect(() => () => { unsubscribeRefs.current.forEach(unsub => unsub()) }, [])

  const start = useCallback(async (details: SplitFixedDetails[], initialStatusMap: Map<string, MatchSplitStatus>) => {
    unsubscribeRefs.current.forEach(unsub => unsub())
    unsubscribeRefs.current = []

    setOutputFileMap(new Map(details.map(d => [d.matchKey, d.outputFile])))
    setProgressMap(new Map())
    setStatusMap(initialStatusMap)

    const unsubStart = window.ipc.onSplitStart(({ matchKey }) => {
      setStatusMap(prev => new Map(prev).set(matchKey, 'splitting'))
    })
    const unsubProgress = window.ipc.onSplitProgress(({ matchKey, percent }) => {
      setProgressMap(prev => new Map(prev).set(matchKey, percent))
    })
    const unsubEnd = window.ipc.onSplitEnd(({ matchKey }) => {
      setStatusMap(prev => new Map(prev).set(matchKey, 'split'))
      setProgressMap(prev => { const next = new Map(prev); next.delete(matchKey); return next })
    })
    unsubscribeRefs.current = [unsubStart, unsubProgress, unsubEnd]

    await window.ipc.splitMatches(details)
  }, [])

  return { statusMap, progressMap, outputFileMap, start }
}
