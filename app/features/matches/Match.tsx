import { Match as TbaMatch } from '../tba-api/api';

export interface Match {
  key: string;
  red_alliance: string[];
  blue_alliance: string[];
  comp_level: string;
  actual_time: number | undefined;
  post_result_time: number | undefined;
}

export function matchFromTbaMatch(tbaMatch: TbaMatch): Match {
  return {
    key: tbaMatch.key,
    red_alliance: tbaMatch.alliances?.red?.team_keys || [],
    blue_alliance: tbaMatch.alliances?.blue?.team_keys || [],
    comp_level: tbaMatch.comp_level.toString(),
    actual_time: tbaMatch.actual_time,
    post_result_time: tbaMatch.post_result_time,
  };
}
