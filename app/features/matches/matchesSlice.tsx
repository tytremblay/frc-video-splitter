import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import * as _ from 'lodash';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { Match as TbaMatch } from '../tba-api/api';
import { matchFromTbaMatch, Match } from './Match';
import { TbaApiInstance as tbaApi } from '../tba-api/tbaApiInstance';

export const getMatches = createAsyncThunk(
  'matches/get',
  async (eventKey: string) => {
    const matchesPromise = tbaApi.matches.getEventMatches(eventKey);
    const tbaMatches = await matchesPromise;
    tbaMatches.sort((a, b) => (a.actual_time || 0) - (b.actual_time || 0));

    const matches = tbaMatches.map((tbaMatch: TbaMatch) =>
      matchFromTbaMatch(tbaMatch)
    );

    return {
      matches,
    };
  }
);

const matchesSelector = (state: RootState) => state.matches;

export const slicedMatchesSelector = createSelector(
  [matchesSelector],
  (matchesState) => {
    const fromIndex = matchesState.firstMatch
      ? matchesState.matches.indexOf(matchesState.firstMatch)
      : 0;
    const toIndex = matchesState.lastMatch
      ? matchesState.matches.indexOf(matchesState.lastMatch)
      : matchesState.matches.length - 1;

    const slicedMatches = matchesState.matches.slice(fromIndex, toIndex);

    return slicedMatches;
  }
);

export interface MatchesState {
  matches: Match[];
  firstMatch: Match | undefined;
  lastMatch: Match | undefined;
  firstMatchVideoOffsetSeconds: number;
  videoSeekSeconds: number;
  currentVideoSeconds: number;
  loading: boolean;
}

const initialState: MatchesState = {
  matches: [],
  firstMatch: undefined,
  lastMatch: undefined,
  firstMatchVideoOffsetSeconds: 0,
  videoSeekSeconds: 0,
  currentVideoSeconds: 0,
  loading: false,
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setFirstMatch: (state, action: PayloadAction<Match | undefined>): void => {
      state.firstMatch = action.payload;
    },
    setLastMatch: (state, action: PayloadAction<Match | undefined>): void => {
      state.lastMatch = action.payload;
    },
    setFirstMatchVideoOffset: (state, action: PayloadAction<number>): void => {
      state.firstMatchVideoOffsetSeconds = action.payload;
    },
    setVideoSeekSeconds: (state, action: PayloadAction<number>): void => {
      state.videoSeekSeconds = action.payload;
    },
    setCurrentVideoSeconds: (state, action: PayloadAction<number>): void => {
      state.currentVideoSeconds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMatches.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getMatches.fulfilled, (state, action) => {
      state.matches = action.payload.matches;
      state.loading = false;
    });
  },
});

export const {
  setFirstMatch,
  setLastMatch,
  setFirstMatchVideoOffset,
  setVideoSeekSeconds,
  setCurrentVideoSeconds,
} = matchesSlice.actions;

export const selectMatchesState = (state: RootState) => state.matches;
export default matchesSlice.reducer;
