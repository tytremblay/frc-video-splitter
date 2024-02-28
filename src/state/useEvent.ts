import { create } from 'zustand';
import { ApiEvent } from '../api/types';

export interface EventState {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  apiEvent?: ApiEvent;
}

export const useEvent = create<EventState>((set, get) => ({
  name: '',
  startDate: '',
  endDate: '',
  location: '',
}));

export function setEventFromApi(event: ApiEvent) {
  useEvent.setState({
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    location: `${event.venue}, ${event.city}, ${event.stateProv}, ${event.country}`,
    apiEvent: event,
  });
}

export function setEvent(eventData: Partial<EventState>) {
  useEvent.setState((state) => ({
    ...state,
    ...eventData,
  }));
}
