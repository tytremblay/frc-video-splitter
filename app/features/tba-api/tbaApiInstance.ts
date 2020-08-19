import { Configuration } from './configuration';
import { MatchApi, EventApi } from './api';

const tbaKey: string | undefined = __TBA_API_KEY__;

const tbaApiConfig = new Configuration({
  apiKey: tbaKey,
});

const events: EventApi = new EventApi(tbaApiConfig);

const matches: MatchApi = new MatchApi(tbaApiConfig);

export interface TbaApiInstance {
  events: EventApi;
  matches: MatchApi;
}

export const TbaApiInstance: TbaApiInstance = {
  events,
  matches,
};
