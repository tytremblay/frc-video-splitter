import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import moment from 'moment';
// eslint-disable-next-line import/no-cycle
import { RootState, AppThunk } from '../../store';
// eslint-disable-next-line import/no-cycle
import { slicedMatchesSelector } from '../matches/matchesSlice';
import { getTimeStamps, formatMatchKey } from '../../utils/helpers';
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

export interface SplitBlock {
  startSeconds: number;
  durationSeconds: number;
}

export interface SplitFixedDetails {
  matchKey: string;
  inputFile: string;
  outputFile: string;
  blocks: SplitBlock[];
}

export interface SplitterState {
  beforePadSeconds: number;
  afterPadSeconds: number;
  teleopLengthSeconds: number;
  autoLengthSeconds: number;
  outputDirectory: string;
  activelySplitting: boolean;
  matchSplitStates: { [matchKey: string]: MatchSplitState };
}

const defaultOutputDirectory = './';

const initialState: SplitterState = {
  beforePadSeconds: 5,
  afterPadSeconds: 20,
  teleopLengthSeconds: 2 * 60 + 15,
  autoLengthSeconds: 15,
  outputDirectory: defaultOutputDirectory,
  activelySplitting: false,
  matchSplitStates: {},
};

const getFilesSelector = (state: RootState) => state.files.files;
const splitterSelector = (state: RootState) => state.splitter;
const matchesSelector = (state: RootState) => state.matches;
const eventsSelector = (state: RootState) => state.events;

export const splitDetailsSelector = createSelector(
  [
    eventsSelector,
    matchesSelector,
    splitterSelector,
    getFilesSelector,
    slicedMatchesSelector,
  ],
  (eventsState, matchesState, splitter, files, slicedMatches): SplitFixedDetails[] => {
    const firstMatchTime = moment.unix(slicedMatches[0]?.actual_time || 0);

    const details = slicedMatches.map((match: Match) => {
      const timeStamps =
        matchesState.adjustedTimestamps[match.key] ||
        getTimeStamps(
          match,
          firstMatchTime,
          moment.duration(matchesState.firstMatchVideoOffsetSeconds, 'seconds')
        );

      const fileName = `${formatMatchKey(match.key)} - ${
        eventsState.selectedYear
      } ${eventsState.selectedEvent?.name}`;

      const fileExtension = files[0].split('.').pop();

      const outputFile =
        splitter.outputDirectory === defaultOutputDirectory
          ? `${splitter.outputDirectory}${fileName}.${fileExtension}`
          : `${splitter.outputDirectory}/${fileName}.${fileExtension}`;

      // @todo make this configurable MatchLengthSeconds and AfterMatchSeconds
      const teleopLengthSeconds = 2 * 60 + 15;
      const autoLengthSeconds = 15;
      const matchLengthSeconds = teleopLengthSeconds + autoLengthSeconds;

      const afterMatchSeconds = 15;

      // console.log("Total Duration", matchLengthSeconds + afterMatchSeconds + splitter.beforePadSeconds+splitter.afterPadSeconds + splitter.beforePadSeconds);

      return {
        matchKey: match.key,
        inputFile: files[0],
        outputFile,
        blocks: [
          // Match
          {
            startSeconds: timeStamps.startSeconds - splitter.beforePadSeconds,
            durationSeconds: matchLengthSeconds + afterMatchSeconds + splitter.beforePadSeconds,
          },
          // Results
          {
            startSeconds: timeStamps.resultsSeconds - splitter.beforePadSeconds,
            durationSeconds: splitter.afterPadSeconds + splitter.beforePadSeconds,
          },
        ],
      };
    });
    console.log(`details`, details);
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
