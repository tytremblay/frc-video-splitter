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
import { AddMatchButton } from './AddMatchButton';
import { MatchItem } from './MatchItem';
import { NoMatches } from './NoMatches';

export function MatchesList() {
  const tbaEvent = useEvent((state) => state.tbaEvent);
  const matches = useMatches((state) => state.matches);
  const tbaMatches = useTbaMatches(tbaEvent);

  useEffect(
    () =>
      tbaMatches.data &&
      tbaEvent &&
      setMatchesFromTBA(tbaEvent, tbaMatches.data),
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

  return matches.length === 0 ? (
    <NoMatches />
  ) : (
    <div className="flex flex-col overflow-y-auto w-full scrollbar-thin scrollbar-thumb-white/20">
      <ul className="divide-y divide-white/10 w-full">
        {matches.map((match, i) => (
          <MatchItem key={match.id} match={match} index={i} />
        ))}
        <li className="h-4">
          <div className="flex items-center justify-center w-full mt-4">
            <AddMatchButton />
          </div>
        </li>
      </ul>
    </div>
  );
}
