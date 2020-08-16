import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import * as tba from '../tba-api/api';
import { Configuration } from '../tba-api/configuration';
import { getFrcYears } from '../../utils/helpers';
import { tbaKey } from '../tba-api/tbaKey';

const tbaApiConfig = new Configuration({
  apiKey: tbaKey,
});

const tbaApi = new tba.EventApi(tbaApiConfig);

export const getEventsByYear = createAsyncThunk(
  'events/getByYear',
  async (year: number) => {
    const eventsPromise = tbaApi.getEventsByYear(year);
    return {
      events: await eventsPromise,
    };
  }
);

export interface EventsState {
  years: number[];
  selectedYear: number;
  events: tba.Event[];
  loading: boolean;
  selectedEvent: tba.Event | null;
}

const initialState: EventsState = {
  years: getFrcYears(),
  selectedYear: getFrcYears()[0],
  events: [],
  loading: false,
  selectedEvent: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedYear: (state, action: PayloadAction<number>): void => {
      state.selectedYear = action.payload;
    },
    setSelectedEvent: (
      state,
      action: PayloadAction<tba.Event | null>
    ): void => {
      state.selectedEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getEventsByYear.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getEventsByYear.fulfilled, (state, action) => {
      state.events = action.payload.events;
      state.loading = false;
    });
  },
});

export const { setSelectedEvent, setSelectedYear } = eventsSlice.actions;
export const selectEvents = (state: RootState) => state.events;
export default eventsSlice.reducer;
