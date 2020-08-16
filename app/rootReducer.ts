import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
/* eslint-disable import/no-cycle */
import workflowReducer from './features/workflow/workflowSlice';
import filesReducer from './features/files/filesSlice';
import eventsReducer from './features/events/eventsSlice';
import matchesReducer from './features/matches/matchesSlice';
import splitterReducer from './features/splitter/splitterSlice';
/* eslint-enable import/no-cycle */

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    workflow: workflowReducer,
    files: filesReducer,
    events: eventsReducer,
    matches: matchesReducer,
    splitter: splitterReducer,
  });
}
