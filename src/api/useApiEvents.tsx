import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getEvents as getFtcEvents } from './ftcApi';
import { getEvents as getTbaEvents } from './tbaApi';
import { ApiEvent, Program } from './types';

export function useApiEvents(program: Program, year: number): UseQueryResult<ApiEvent[], Error> {
  const events = useQuery({
    queryKey: ['events', program, year],
    retry: false,
    queryFn: async () => {
      if (program == 'frc') {
        const events = await getTbaEvents(year);
        return events.map((event) => ({
          program: 'frc',
          key: event.key,
          name: event.name,
          startDate: event.start_date,
          endDate: event.end_date,
          venue: event.location_name,
          city: event.city,
          stateProv: event.state_prov,
          country: event.country,
        } as ApiEvent))
      } else {
        const events = await getFtcEvents(year);
        return events.map((event) => ({
          program: 'ftc',
          key: { year: year, code: event.code },
          name: event.name,
          startDate: event.dateStart.split('T')[0],
          endDate: event.dateEnd.split('T')[0],
          venue: event.venue,
          city: event.city,
          stateProv: event.stateprov,
          country: event.country,
        } as ApiEvent))
      }
    }
  });

  return events;
}
