export type Program = 'frc' | 'ftc';

export type ApiEvent = FrcApiEvent | FtcApiEvent;

interface FrcApiEvent {
  program: 'frc';
  key: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  stateProv: string;
  country: string;
}

interface FtcApiEvent {
  program: 'ftc';
  key: { year: number; code: string };
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  stateProv: string;
  country: string;
}

export interface ApiMatch {
  id: string;
  name: string;
  series?: number;
  number: number;
  scheduledTime?: Date;
  startTime?: Date;
  resultsTime?: Date;
  level: MatchLevel;
  redAlliance: string[];
  blueAlliance: string[];
}

export enum MatchLevel {
  Qualification,
  EighthFinal,
  QuarterFinal,
  SemiFinal,
  Final,
}
