import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { ApiMatch } from '../api/types';
import {
  matchLengthSeconds,
  resultsEndPaddingSeconds,
  resultsStartPaddingSeconds,
  separateMatchResults,
  videoEndPaddingSeconds,
  videoStartPaddingSeconds,
} from './settings';

export type SplitterMatch = {
  id: string;
  name: string;
  description: string;
  sourceVideoPath: string;
  fromSeconds?: number;
  toSeconds?: number;
  fromResultsSeconds?: number;
  toResultsSeconds?: number;
  splitPercentage: number;
  startTime?: number;
  startSeconds?: number;
  resultsTime?: number;
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

export function setMatchesFromApi(apiMatches: ApiMatch[]) {
  const matches: SplitterMatch[] = apiMatches.map((m) => {
    const description = `${m.redAlliance.join(', ')} vs ${m.blueAlliance.join(
      ', '
    )}`;
    return {
      id: m.id,
      name: m.name,
      description,
      sourceVideoPath: '',
      splitPercentage: 0,
      startTime: m.startTime ? m.startTime.getTime() / 1000 : undefined,
      resultsTime: m.resultsTime ? m.resultsTime.getTime() / 1000 : undefined,
    };
  });
  useMatches.setState({ matches });
}

export function addMatch(match: SplitterMatch, index?: number) {
  const oldMatches = [...useMatches.getState().matches];
  if (index === undefined) {
    index = oldMatches.length;
  }
  const newMatches = oldMatches
    .slice(undefined, index)
    .concat(match)
    .concat(oldMatches.slice(index, undefined));
  useMatches.setState({
    matches: newMatches,
  });
}

export function addBlankMatch() {
  addMatch({
    id: uuid(),
    name: ``,
    description: '',
    sourceVideoPath: '',
    splitPercentage: 0,
  });
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

export function autoFillTimeStamps(
  startingMatchIndex: number,
  startingVideoSeconds: number,
  videoLength: number
) {
  const matches = [...useMatches.getState().matches];
  let currentVideoSeconds = startingVideoSeconds;
  for (let i = startingMatchIndex; currentVideoSeconds < videoLength; i++) {
    const match = { ...matches[i] };
    const nextMatch = matches[i + 1];
    if (
      !match ||
      match.resultsTime === undefined ||
      match.startTime === undefined ||
      (nextMatch && nextMatch?.startTime === undefined)
    ) {
      break;
    }
    let matchLength;
    if (separateMatchResults) {
      match.fromSeconds = currentVideoSeconds - videoStartPaddingSeconds.value;
      match.startSeconds = currentVideoSeconds;
      matchLength = matchLengthSeconds.value;

      match.fromResultsSeconds =
        currentVideoSeconds +
        (match.resultsTime - match.startTime) -
        resultsStartPaddingSeconds.value;

      match.toResultsSeconds =
        currentVideoSeconds +
        (match.resultsTime - match.startTime) +
        resultsEndPaddingSeconds.value;
    } else {
      match.fromSeconds = currentVideoSeconds;
      matchLength = match.resultsTime - match.startTime;
    }
    match.toSeconds =
      currentVideoSeconds + matchLength + videoEndPaddingSeconds.value;
    currentVideoSeconds = match.toSeconds - videoEndPaddingSeconds.value;
    if (match.toSeconds > videoLength) {
      match.toSeconds = videoLength;
      currentVideoSeconds = videoLength;
    }
    matches[i] = match;
    if (nextMatch && nextMatch.startTime !== undefined) {
      currentVideoSeconds +=
        nextMatch.startTime - (match.startTime + matchLength);
    }
  }
  useMatches.setState({
    matches,
  });
}
