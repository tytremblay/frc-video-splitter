import moment from 'moment';
import { Match } from '../features/matches/Match';

export interface MatchTimestamps {
  matchKey: string;
  startSeconds: number | undefined;
  resultsSeconds: number | undefined;
  lengthSeconds: number | undefined;
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
  firstMatchTime: moment.Moment | undefined,
  firstMatchOffset: moment.Duration
): MatchTimestamps {
  if (!firstMatchTime) {
    return {
      matchKey: match.key,
      startSeconds: undefined,
      resultsSeconds: undefined,
      lengthSeconds: undefined,
    };
  }
  const startTime = match.actual_time
    ? moment.unix(match.actual_time)
    : undefined;
  const resultsTime = match.post_result_time
    ? moment.unix(match.post_result_time)
    : undefined;

  const matchStart = firstMatchOffset
    .clone()
    .add(moment.duration(startTime?.diff(firstMatchTime)));

  if (!resultsTime) {
    return {
      matchKey: match.key,
      startSeconds: matchStart.as('seconds'),
      resultsSeconds: undefined,
      lengthSeconds: undefined,
    };
  }
  const matchLength = moment.duration(resultsTime?.diff(startTime));
  const matchResults = matchStart.clone().add(matchLength);

  return {
    matchKey: match.key,
    startSeconds: matchStart.as('seconds'),
    resultsSeconds: matchResults.as('seconds'),
    lengthSeconds: matchLength.as('seconds'),
  };
}
