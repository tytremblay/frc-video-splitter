import { TBAEvent, TBAMatch } from './TBATypes';

const tbaRoot = 'https://www.thebluealliance.com/api/v3';
const tbaKey = process.env.TBA_KEY;

export async function getMatches(eventKey: string) {
  const req = await fetch(`${tbaRoot}/event/${eventKey}/matches`, {
    headers: { 'X-TBA-Auth-Key': tbaKey },
  });
  const res = (await req.json()) as TBAMatch[];
  return res;
}

export async function getEvents(year: number) {
  const res = await fetch(`${tbaRoot}/events/${encodeURIComponent(year)}`, {
    headers: {
      'X-TBA-Auth-Key': tbaKey,
    },
  });
  const events = (await res.json()) as TBAEvent[];
  return events.sort((a, b) => a.start_date.localeCompare(b.start_date));
}
