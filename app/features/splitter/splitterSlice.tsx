import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import moment from 'moment';
// eslint-disable-next-line import/no-cycle
import { RootState, AppThunk } from '../../store';
// eslint-disable-next-line import/no-cycle
import { slicedMatchesSelector } from '../matches/matchesSlice';
import { getTimeStamps } from '../../utils/helpers';
import { Match } from '../matches/Match';

export interface MatchSplitState {
  matchKey: string;
  active: boolean;
  percent: number;
  finished: boolean;
}

export interface SplitDetails {
  matchKey: string;
  inputFile: string;
  outputFile: string;
  startSeconds: number;
  durationSeconds: number;
}

export interface SplitterState {
  beforePadSeconds: number;
  afterPadSeconds: number;
  outputDirectory: string;
  activelySplitting: boolean;
  matchSplitStates: { [matchKey: string]: MatchSplitState };
}

const initialState: SplitterState = {
  beforePadSeconds: 5,
  afterPadSeconds: 20,
  outputDirectory: '/',
  activelySplitting: false,
  matchSplitStates: {},
};

const getFilesSelector = (state: RootState) => state.files.files;
const splitterSelector = (state: RootState) => state.splitter;
const matchesSelector = (state: RootState) => state.matches;

export const splitDetailsSelector = createSelector(
  [matchesSelector, splitterSelector, getFilesSelector, slicedMatchesSelector],
  (matchesState, splitter, files, slicedMatches) => {
    const firstMatchTime = moment.unix(slicedMatches[0]?.actual_time);

    const details = slicedMatches.map((match: Match) => {
      const { start, length } = getTimeStamps(
        match,
        firstMatchTime,
        moment.duration(matchesState.firstMatchVideoOffsetSeconds, 'seconds')
      );

      const paddedLength = length
        .clone()
        .add(splitter.beforePadSeconds, 'seconds')
        .add(splitter.afterPadSeconds, 'seconds');

      const outputFile =
        splitter.outputDirectory === '/'
          ? `${splitter.outputDirectory}${match.key}.mp4`
          : `${splitter.outputDirectory}/${match.key}.mp4`;

      return {
        matchKey: match.key,
        inputFile: files[0],
        outputFile,
        startSeconds: start.asSeconds() - splitter.beforePadSeconds,
        durationSeconds: paddedLength.asSeconds(),
      };
    });
    return details;
  }
);

const splitterSlice = createSlice({
  name: 'splitter',
  initialState,
  reducers: {
    setBeforePadSeconds: (state, action: PayloadAction<number>): void => {
      state.beforePadSeconds = action.payload;
    },
    setAfterPadSeconds: (state, action: PayloadAction<number>): void => {
      state.afterPadSeconds = action.payload;
    },
    setOutputDirectory: (state, action: PayloadAction<string>): void => {
      state.outputDirectory = action.payload;
    },
    setActivelySplitting: (state, action: PayloadAction<boolean>): void => {
      state.activelySplitting = action.payload;
    },
    setMatchSplitState: (
      state,
      action: PayloadAction<MatchSplitState>
    ): void => {
      state.matchSplitStates[action.payload.matchKey] = action.payload;
    },
  },
});

export const {
  setBeforePadSeconds,
  setAfterPadSeconds,
  setOutputDirectory,
  setActivelySplitting,
  setMatchSplitState,
} = splitterSlice.actions;

export const selectSplitter = (state: RootState) => state.splitter;
export default splitterSlice.reducer;
