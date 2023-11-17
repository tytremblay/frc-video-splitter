import React from "react";
import { create } from 'zustand';
import { TBAEvent } from '../tba/TBATypes';

export interface EventState {
  name: string,
  startDate: string,
  endDate: string,
  location: string,
  tbaEvent?: TBAEvent
}

export const useEvent = create<EventState>((set, get) => ({
  name: '',
  startDate: '',
  endDate: '',
  location: '',
}));

export function setEventFromTBA(event: TBAEvent) {
  useEvent.setState({
    name: event.name,
    startDate: event.start_date,
    endDate: event.end_date,
    location: `${event.location_name}, ${event.city}, ${event.state_prov}, ${event.country}`,
    tbaEvent: event
  });
}

export function setEvent(eventData: Partial<EventState>) {
  useEvent.setState(state => ({
    ...state,
    ...eventData
  }));
}