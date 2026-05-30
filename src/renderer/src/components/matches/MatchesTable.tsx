import { useQuery } from "@tanstack/react-query";
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TBAMatch } from '../../tba/TBATypes';
import { useEvent } from '../../state';
import { MatchesTableHeader } from './MatchesTableHeader';
import { MatchRow } from './MatchRow';
import { addBlankMatch, setMatchesFromTBA, useMatches } from '../../state/useMatches';

const tbaKey: string | undefined = import.meta.env.VITE_TBA_API_KEY;

async function getMatches(eventKey: string) {
  const req = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`, {
    headers: { 'X-TBA-Auth-Key': tbaKey }
  });
  return await req.json() as TBAMatch[];
}

const compLevelValues = {
  qm: 0,
  ef: 1,
  qf: 2,
  sf: 3,
  f: 4,
};

function matchSorter(a: TBAMatch, b: TBAMatch) {
  if (a.actual_time && b.actual_time) return a.actual_time - b.actual_time;
  if (a.time && b.time) return a.time - b.time;
  if (compLevelValues[a.comp_level] === compLevelValues[b.comp_level]) {
    return a.match_number - b.match_number;
  }
  return compLevelValues[a.comp_level] - compLevelValues[b.comp_level];
}

export function MatchesTable() {
  const tbaEvent = useEvent(state => state.tbaEvent);
  const matches = useMatches(state => state.matches);
  const tbaMatches = useQuery({
    queryKey: ['matches', tbaEvent?.key],
    queryFn: async () => getMatches(tbaEvent.key),
    enabled: !!tbaEvent?.key,
    select: data => data.sort(matchSorter),
  });

  useEffect(() => {
    if (tbaMatches.data) setMatchesFromTBA(tbaEvent, tbaMatches.data)
  }, [tbaMatches.data]);

  if (tbaMatches.isPending && tbaEvent?.key) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
        Loading matches from TBA…
      </div>
    );
  }

  if (tbaMatches.isError) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive py-4">
        <div className="size-1.5 rounded-full bg-destructive" />
        Error loading matches: {tbaMatches.error.message}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/50 p-8 text-center">
        <div className="space-y-1">
          <p className="text-sm font-semibold">No matches yet</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Link an event from TBA or add matches manually to start marking timestamps.
          </p>
        </div>
        <Button type="button" onClick={() => addBlankMatch(0)} size="sm" variant="outline">
          Add match
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border/60 bg-card">
      <table className="min-w-full border-separate border-spacing-0">
        <MatchesTableHeader />
        <tbody>
          {matches.map((match, i) => (
            <MatchRow key={match.id} match={match} index={i} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="px-4 py-2 sm:px-6">
              <button
                type="button"
                onClick={() => addBlankMatch(matches.length)}
                className="text-xs text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <span className="text-base leading-none">+</span>
                Add match
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
