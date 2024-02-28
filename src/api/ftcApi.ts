import { EventList, HybridSchedule } from './FTCTypes';

const ftcRoot = 'https://ftc-api.firstinspires.org/v2.0';
const ftcUser = import.meta.env.VITE_FTC_USER;
const ftcPass = import.meta.env.VITE_FTC_PASS;
const authHeader = `Basic ${btoa(`${ftcUser}:${ftcPass}`)}`;

export async function getMatches(year: number, eventKey?: string) {
  if (!eventKey) {
    return Promise.reject('No event key provided');
  }
  const reqQual = await fetch(
    `${ftcRoot}/${year}/schedule/${eventKey}/qual/hybrid`,
    {
      headers: { Authorization: authHeader },
    }
  );
  const resQual = (await reqQual.json()) as HybridSchedule;
  const reqPlayoff = await fetch(
    `${ftcRoot}/${year}/schedule/${eventKey}/playoff/hybrid`,
    {
      headers: { Authorization: authHeader },
    }
  );
  const resPlayoff = (await reqPlayoff.json()) as HybridSchedule;
  return [...resQual.schedule, ...resPlayoff.schedule];
}

export async function getEvents(year: number) {
  const res = await fetch(`${ftcRoot}/${encodeURIComponent(year)}/events`, {
    headers: {
      Authorization: authHeader,
    },
  });
  const events = (await res.json()) as EventList;
  return events.events.sort((a, b) => a.dateStart.localeCompare(b.dateEnd));
}
