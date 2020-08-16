import { Match as TbaMatch } from '../tba-api/api';

export interface Match {
  key: string;
  red_alliance: string[];
  blue_alliance: string[];
  actual_time: number;
  post_result_time: number;
}

export function matchFromTbaMatch(tbaMatch: TbaMatch): Match {
  return {
    key: tbaMatch.key,
    red_alliance: tbaMatch.alliances?.red?.team_keys || [],
    blue_alliance: tbaMatch.alliances?.blue?.team_keys || [],
    actual_time: tbaMatch.actual_time || 0,
    post_result_time: tbaMatch.post_result_time || 0,
  };
}
