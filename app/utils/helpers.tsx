import moment from 'moment';
import { Match } from '../features/matches/Match';

export interface MatchTimestamps {
  start: moment.Duration;
  results: moment.Duration;
  length: moment.Duration;
}

export function getFrcYears(): number[] {
  const d = new Date();
  const thisYear = d.getFullYear();
  const years = [];

  for (let year = thisYear; year >= 1992; year--) {
    years.push(year);
  }
  return years;
}

export function formatMatchKey(matchKey: string): string {
  return matchKey.split('_')[1].toUpperCase();
}

export function getTimeStamps(
  match: Match,
  firstMatchTime: moment.Moment,
  firstMatchOffset: moment.Duration
): MatchTimestamps {
  const startTime = moment.unix(match.actual_time);
  const resultsTime = moment.unix(match.post_result_time);
  const matchLength = moment.duration(resultsTime.diff(startTime));
  const matchStart = firstMatchOffset
    .clone()
    .add(moment.duration(startTime.diff(firstMatchTime)));
  const matchResults = matchStart.clone().add(matchLength);

  return {
    start: matchStart,
    results: matchResults,
    length: matchLength,
  };
}
