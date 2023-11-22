import { useQuery } from '@tanstack/react-query';
import { TBAEvent, TBAMatch } from './TBATypes';
import { getMatches } from './tbaApi';

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

export function useTbaMatches(tbaEvent?: TBAEvent) {
  const tbaMatches = useQuery({
    queryKey: ['matches', tbaEvent?.key],
    queryFn: async () => getMatches(tbaEvent.key),
    enabled: !!tbaEvent?.key,
    select: (data) => data.sort(matchSorter),
  });

  return tbaMatches;
}
