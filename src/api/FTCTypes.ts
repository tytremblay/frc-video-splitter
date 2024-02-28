export interface EventList {
  events: Event[];
  eventCount: number;
}

export interface Event {
  eventId: string;
  code: string;
  divisionCode: null | string;
  name: string;
  remote: boolean;
  hybrid: boolean;
  fieldCount: number;
  published: boolean;
  type: string;
  typeName: string;
  regionCode: string;
  leagueCode: null | string;
  districtCode: string;
  venue: string;
  address: string;
  city: string;
  stateprov: string;
  country: string;
  website: null | string;
  liveStreamUrl: null | string;
  timezone: string;
  dateStart: string;
  dateEnd: string;
}

export interface HybridSchedule {
  schedule: FTCMatch[];
}

export interface FTCMatch {
  description: string;
  tournamentLevel: TournamentLevel;
  series: number;
  matchNumber: number;
  startTime: string;
  actualStartTime: string;
  postResultTime: string;
  scoreRedFinal: number;
  scoreRedFoul: number;
  scoreRedAuto: number;
  scoreBlueFinal: number;
  scoreBlueFoul: number;
  scoreBlueAuto: number;
  scoreBlueDriveControlled: number;
  scoreBlueEndgame: number;
  redWins: boolean;
  blueWins: boolean;
  teams: Team[];
}

export interface Team {
  teamNumber: number;
  displayTeamNumber: string;
  station: Station;
  surrogate: boolean;
  noShow: boolean;
  dq: boolean;
  onField: boolean;
  teamName: string;
}

export enum Station {
  Blue1 = 'Blue1',
  Blue2 = 'Blue2',
  Blue3 = 'Blue3',
  Red1 = 'Red1',
  Red2 = 'Red2',
  Red3 = 'Red3',
}

export enum TournamentLevel {
  Qualification = 'QUALIFICATION',
  Semifinal = 'SEMIFINAL',
  Final = 'FINAL',
}
