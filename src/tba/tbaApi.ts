import { TBAEvent, TBAMatch } from './TBATypes';

const tbaRoot = 'https://www.thebluealliance.com/api/v3';
const tbaKey = import.meta.env.VITE_TBA_KEY;

console.log('TBA Key:', tbaKey);

export async function getMatches(eventKey?: string) {
  if (!eventKey) {
    return Promise.reject('No event key provided');
  }
  const req = await fetch(`${tbaRoot}/event/${eventKey}/matches`, {
    headers: { 'X-TBA-Auth-Key': tbaKey || '' },
  });
  const res = (await req.json()) as TBAMatch[];
  return res;
}

export async function getEvents(year: number) {
  const res = await fetch(`${tbaRoot}/events/${encodeURIComponent(year)}`, {
    headers: {
      'X-TBA-Auth-Key': tbaKey || '',
    },
  });
  const events = (await res.json()) as TBAEvent[];
  return events.sort((a, b) => a.start_date.localeCompare(b.start_date));
}
