import { useQuery } from '@tanstack/react-query';
import { FTCMatch, TournamentLevel } from './FTCTypes';
import { TBAMatch } from './TBATypes';
import { getMatches as getFtcMatches } from './ftcApi';
import { getMatches as getTbaMatches } from './tbaApi';
import { ApiEvent, ApiMatch, MatchLevel } from './types';

function matchSorter(a: ApiMatch, b: ApiMatch) {
  if (a.startTime && b.startTime) {
    return a.startTime.getTime() - b.startTime.getTime();
  }
  if (a.scheduledTime && b.scheduledTime) {
    return a.scheduledTime.getTime() - b.scheduledTime.getTime();
  }
  if (a.level == b.level) {
    if (a.series != b.series) {
      return (a.series || 0) - (b.series || 0);
    }
    return a.number - b.number;
  }
  return a.level - b.level;
}

export function useApiMatches(apiEvent?: ApiEvent) {
  const apiMatches = useQuery({
    queryKey: ['matches', apiEvent?.program, apiEvent?.key],
    queryFn: async () => {
      if (!apiEvent) {
        return [];
      }
      if (apiEvent.program == 'frc') {
        const tbaMatches = await getTbaMatches(apiEvent.key)
        return tbaMatches.map((match: TBAMatch) => {
          return {
            id: match.key,
            name: match.key.split('_')[1],
            number: match.match_number,
            scheduledTime: match.time ? new Date(match.time * 1000) : undefined,
            startTime: match.time ? new Date(match.actual_time * 1000) : undefined,
            resultsTime: match.time ? new Date(match.post_result_time * 1000) : undefined,
            level: {
              'qm': MatchLevel.Qualification,
              'ef': MatchLevel.EighthFinal,
              'qf': MatchLevel.QuarterFinal,
              'sf': MatchLevel.SemiFinal,
              'f': MatchLevel.Final,
            }[match.comp_level],
            redAlliance: match.alliances.red.team_keys.map(t => t.replace('frc', '')),
            blueAlliance: match.alliances.blue.team_keys.map(t => t.replace('frc', '')),
          } as ApiMatch;
        });
      } else {
        const ftcMatches = await getFtcMatches(apiEvent.key.year, apiEvent.key.code)
        return ftcMatches.map((match: FTCMatch) => {
          let name;
          if (match.tournamentLevel == TournamentLevel.Qualification) {
            name = `Q${match.matchNumber}`
          } else if (match.tournamentLevel == TournamentLevel.Semifinal) {
            name = `SF${match.series}-${match.matchNumber}`
          } else if (match.tournamentLevel == TournamentLevel.Final) {
            name = `F${match.matchNumber}`
          }
          return {
            id: `${apiEvent.key.year}-${apiEvent.key.code}-${match.tournamentLevel}-${match.series}-${match.matchNumber}`,
            name,
            series: match.series > 0 ? match.series : undefined,
            number: match.matchNumber,
            scheduledTime: match.startTime == "0001-01-01T00:00:00" ? undefined : new Date(match.startTime),
            startTime: match.actualStartTime == "0001-01-01T00:00:00" ? undefined : new Date(match.actualStartTime),
            resultsTime: match.postResultTime == "0001-01-01T00:00:00" ? undefined : new Date(match.postResultTime),
            level: {
              [TournamentLevel.Qualification]: MatchLevel.Qualification,
              [TournamentLevel.Semifinal]: MatchLevel.SemiFinal,
              [TournamentLevel.Final]: MatchLevel.Final,
            }[match.tournamentLevel],
            redAlliance: match.teams.filter(t => t.station.startsWith("Red")).map(t => t.displayTeamNumber),
            blueAlliance: match.teams.filter(t => t.station.startsWith("Blue")).map(t => t.displayTeamNumber),
          } as ApiMatch;
        });
      }
    },
    enabled: !!apiEvent?.key,
    select: (data) => data.sort(matchSorter),
  });

  return apiMatches;
}
