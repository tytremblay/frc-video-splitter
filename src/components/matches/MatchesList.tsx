import { useEffect } from 'react';
import { useEvent } from '../../state';
import {
  SplitProgressEvent,
  SplitStartEvent,
  setMatchSplitStatus,
  setMatchesFromTBA,
  useMatches,
} from '../../state/useMatches';
import { useTbaMatches } from '../../tba';
import { MatchItem } from './MatchItem';
import { NoMatches } from './NoMatches';

export function MatchesList() {
  const tbaEvent = useEvent((state) => state.tbaEvent);
  const matches = useMatches((state) => state.matches);
  const tbaMatches = useTbaMatches(tbaEvent);

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
