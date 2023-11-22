import { useQuery } from '@tanstack/react-query';
import { getEvents } from './tbaApi';

export function useTbaEvents(year: number) {
  const events = useQuery({
    queryKey: ['events', year],
    queryFn: async () => getEvents(year),
  });

  return events;
}
