import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { Event } from '../tba-api/api';
import { getFrcYears } from '../../utils/helpers';
import { TbaApiInstance as tbaApi } from '../tba-api/tbaApiInstance';

export const getEventsByYear = createAsyncThunk(
  'events/getByYear',
  async (year: number) => {
    const eventsPromise = tbaApi.events.getEventsByYear(year);
    return {
      events: await eventsPromise,
    };
  }
);

export interface EventsState {
  years: number[];
  selectedYear: number;
  events: Event[];
  loading: boolean;
  selectedEvent: Event | null;
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
    setSelectedEvent: (state, action: PayloadAction<Event | null>): void => {
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
