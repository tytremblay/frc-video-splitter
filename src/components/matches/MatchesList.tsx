import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useEvent } from '../../state';
import {
  SplitProgressEvent,
  SplitStartEvent,
  setMatchSplitStatus,
  setMatchesFromTBA,
  useMatches,
} from '../../state/useMatches';
import { TBAMatch } from '../../tba/TBATypes';
import { MatchItem } from './MatchItem';
import { NoMatches } from './NoMatches';

async function getMatches(eventKey: string) {
  const req = await fetch(
    `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`,
    { headers: { 'X-TBA-Auth-Key': window.ipc.tbaKey } }
  );
  const res = (await req.json()) as TBAMatch[];

  return res;
}

const compLevelValues = {
  qm: 0,
  ef: 1,
  qf: 2,
  sf: 3,
  f: 4,
};

function matchSorter(a: TBAMatch, b: TBAMatch) {
  if (a.actual_time && b.actual_time) {
    return a.actual_time - b.actual_time;
  }
  if (a.time && b.time) {
    return a.time - b.time;
  }
  if (compLevelValues[a.comp_level] === compLevelValues[b.comp_level]) {
    return a.match_number - b.match_number;
  }
  return compLevelValues[a.comp_level] - compLevelValues[b.comp_level];
}

export function MatchesList() {
  const tbaEvent = useEvent((state) => state.tbaEvent);
  const matches = useMatches((state) => state.matches);
  const tbaMatches = useQuery({
    queryKey: ['matches', tbaEvent?.key],
    queryFn: async () => getMatches(tbaEvent.key),
    enabled: !!tbaEvent?.key,
    select: (data) => data.sort(matchSorter),
  });

  useEffect(
    () => tbaMatches.data && setMatchesFromTBA(tbaEvent, tbaMatches.data),
    [tbaMatches.data]
  );

  useEffect(() => {
    window.ipc.on('split-start', (progress: SplitStartEvent) =>
      setMatchSplitStatus(progress.id, 0)
    );
    window.ipc.on('split-progress', (progress: SplitProgressEvent) => {
      console.log(progress);
      setMatchSplitStatus(progress.id, 100);
    });
  }, []);

  if (tbaMatches.isLoading) return <div>Loading Matches...</div>;
  if (tbaMatches.isError)
    return <div>Error Loading Matches: {tbaMatches.error.message}</div>;

  return (
    <div className="inline-block min-w-full align-middle">
      {matches.length === 0 ? (
        <NoMatches />
      ) : (
        <ul className="divide-y divide-white/5">
          {matches.map((match, i) => (
            <MatchItem key={match.id} match={match} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
