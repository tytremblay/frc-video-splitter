import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useEvent } from './index'
import { setMatchesFromTBA } from './useMatches'
import { TBAMatch } from '../tba/TBATypes'
import { useSettings } from './useSettings'

const compLevelValues: Record<string, number> = { qm: 0, ef: 1, qf: 2, sf: 3, f: 4 }

function matchSorter(a: TBAMatch, b: TBAMatch) {
  if (a.actual_time && b.actual_time) return a.actual_time - b.actual_time
  if (a.time && b.time) return a.time - b.time
  if (compLevelValues[a.comp_level] === compLevelValues[b.comp_level]) {
    return a.match_number - b.match_number
  }
  return compLevelValues[a.comp_level] - compLevelValues[b.comp_level]
}

export function useTBAMatchSync() {
  const tbaEvent = useEvent(state => state.tbaEvent)
  const { tbaApiKey } = useSettings()
  const apiKey = (import.meta.env.VITE_TBA_API_KEY as string) || tbaApiKey

  const query = useQuery({
    queryKey: ['matches', tbaEvent?.key],
    queryFn: async () => {
      const req = await fetch(
        `https://www.thebluealliance.com/api/v3/event/${tbaEvent!.key}/matches`,
        { headers: { 'X-TBA-Auth-Key': apiKey } }
      )
      return (await req.json()) as TBAMatch[]
    },
    enabled: !!tbaEvent?.key,
    select: data => data.sort(matchSorter),
  })

  useEffect(() => {
    if (query.data && tbaEvent) setMatchesFromTBA(tbaEvent, query.data)
  }, [query.data, tbaEvent])

  return query
}
