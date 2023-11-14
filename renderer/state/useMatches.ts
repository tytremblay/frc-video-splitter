import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { TBAEvent, TBAMatch } from '../tba/TBATypes';

export type SplitterMatch = {
  id: string;
  name: string;
  description: string;
  sourceVideoPath: string;
  fromSeconds?: number;
  toSeconds?: number;
  splitPercentage: number;
};

export interface MatchesState {
  matches: SplitterMatch[];
  selectedMatchIds: string[];
  matchSplitPercentages: Record<string, number>;
}

export type SplitEndEvent = {
  id: string;
};

export type SplitStartEvent = {
  id: string;
};

export type SplitProgressEvent = {
  id: string;
  progress: number;
};

export const useMatches = create<MatchesState>((set, get) => ({
  matches: [],
  selectedMatchIds: [],
  matchSplitPercentages: {},
}));

export function setMatches(matches: SplitterMatch[]) {
  useMatches.setState({
    matches,
  });
}

export function setMatchesFromTBA(tbaEvent: TBAEvent, tbaMatches: TBAMatch[]) {
  function matchKeyToNumber(key: string) {
    const matchNumber = key.replace(/\D/g, '');
    return parseInt(matchNumber);
  }
  const matches: SplitterMatch[] = tbaMatches.map((t) => ({
    id: t.key,
    name: `${t.comp_level.toUpperCase()}${t.match_number}`,
    description: `${t.alliances.red.team_keys
      .map(matchKeyToNumber)
      .join(', ')} vs ${t.alliances.blue.team_keys
      .map(matchKeyToNumber)
      .join(', ')}`,
    sourceVideoPath: '',
    splitPercentage: 0,
  }));
  useMatches.setState({ matches });
}

export function addMatch(match: SplitterMatch, index: number) {
  const oldMatches = [...useMatches.getState().matches];
  const newMatches = oldMatches
    .slice(undefined, index)
    .concat(match)
    .concat(oldMatches.slice(index, undefined));
  useMatches.setState({
    matches: newMatches,
  });
}

export function addBlankMatch(index: number) {
  addMatch(
    {
      id: uuid(),
      name: '',
      description: '',
      sourceVideoPath: '',
      splitPercentage: 0,
    },
    index
  );
}

export function updateMatch(index: number, data: Partial<SplitterMatch>) {
  const matches = [...useMatches.getState().matches];
  matches[index] = { ...matches[index], ...data };
  useMatches.setState({
    matches,
  });
}

export function removeMatch(matchId: string) {
  const matches = [...useMatches.getState().matches].filter(
    (m) => m.id !== matchId
  );
  useMatches.setState({
    matches,
  });
}

export function setSelectedMatchIds(matchIds: string[]) {
  useMatches.setState({
    selectedMatchIds: matchIds,
  });
}

export function selectMatches(...matchIds: string[]) {
  const selectedMatchIds = new Set([
    ...useMatches.getState().selectedMatchIds,
    ...matchIds,
  ]);
  setSelectedMatchIds(Array.from(selectedMatchIds));
}

export function deselectMatches(...matchIds: string[]) {
  const selectedMatchIds = new Set(useMatches.getState().selectedMatchIds);
  matchIds.forEach((id) => selectedMatchIds.delete(id));
  setSelectedMatchIds(Array.from(selectedMatchIds));
}

export function clearSelectedMatches() {
  setSelectedMatchIds([]);
}

export function toggleMatchSelection(matchId: string) {
  if (useMatches.getState().selectedMatchIds.includes(matchId)) {
    deselectMatches(matchId);
  } else {
    selectMatches(matchId);
  }
}

export function setMatchSplitStatus(matchId: string, percent: number) {
  const matchSplitStates = { ...useMatches.getState().matchSplitPercentages };
  matchSplitStates[matchId] = percent;
  useMatches.setState({
    matchSplitPercentages: matchSplitStates,
  });
}
