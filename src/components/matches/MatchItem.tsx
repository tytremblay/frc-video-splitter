import { clsx } from 'clsx';
import { useMemo } from 'react';
import {
  SplitterMatch,
  autoFillTimeStamps,
  updateMatch,
  useMatches,
} from '../../state/useMatches';
import { seekSeconds, useVideo } from '../../state/useVideo';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons';
import { MatchDescription } from './MatchDescription';
import { MatchTitle } from './MatchTitle';
import { TimestampButton } from './TimestampButton';

export interface MatchItemProps {
  match: SplitterMatch;
  index: number;
}
const statuses = {
  new: 'text-gray-500 bg-gray-100/10',
  readyToSplit: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10',
};

export function MatchItem(props: MatchItemProps) {
  const selectedMatches = useMatches((state) => state.selectedMatchIds);
  const percentages = useMatches((state) => state.matchSplitPercentages);
  const status = useMemo(() => {
    if (
      props.match.fromSeconds !== undefined &&
      props.match.toSeconds !== undefined
    ) {
      return 'readyToSplit';
    }
    return 'new';
  }, [props.match.fromSeconds, props.match.toSeconds]);

  const badgeText = useMemo(() => {
    if (status === 'new') {
      return 'Needs Timestamps';
    }
    if (status === 'readyToSplit') {
      if (percentages[props.match.id] === undefined) {
        return 'Ready to Split';
      }

      return `${percentages[props.match.id]}%`;
    }
    return 'Error';
  }, [status, percentages, props.match.id]);

  return (
    <li
      key={props.match.id}
      className={clsx(
        'relative flex items-center space-x-4 p-2',
        selectedMatches.includes(props.match.id)
          ? 'bg-gray-600/50 hover:bg-gray-600/70'
          : 'hover:bg-gray-600/20'
      )}
    >
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-3">
          <div
            className={clsx(statuses[status], 'flex-none rounded-full p-1')}
            onClick={() => console.log('clicked match ', props.match.name)}
          >
            <div className="h-2 w-2 rounded-full bg-current" />
          </div>
          <h2 className="min-w-0 text-sm font-semibold leading-6 text-white flex-grow">
            <div className="flex gap-x-2">
              <MatchTitle match={props.match} index={props.index} />
              <span className="text-gray-400">/</span>
              <MatchDescription match={props.match} index={props.index} />
            </div>
          </h2>
        </div>
        <div className="mt-3 ml-6 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
          <div className="flex flex-row gap-4 align-middle items-center">
            <span className="text-gray-400">from</span>
            <TimestampButton
              timestampSeconds={props.match.fromSeconds}
              onSet={() => {
                updateMatch(props.index, {
                  fromSeconds: useVideo.getState().currentSeconds,
                });
              }}
              onSeek={() =>
                props.match.fromSeconds && seekSeconds(props.match.fromSeconds)
              }
            />
            <span className="text-gray-400">to</span>
            <TimestampButton
              timestampSeconds={props.match.toSeconds}
              onSet={() =>
                updateMatch(props.index, {
                  toSeconds: useVideo.getState().currentSeconds,
                })
              }
              onSeek={() =>
                props.match.toSeconds && seekSeconds(props.match.toSeconds)
              }
            />
          </div>
        </div>
      </div>
      <Badge type={status === 'new' ? 'info' : 'success'} text={badgeText} />
      {props.match.startTime && props.match.resultsTime && (
        <Button
          secondary
          size="sm"
          onClick={() =>
            props.match.fromSeconds &&
            autoFillTimeStamps(
              props.index,
              props.match.fromSeconds,
              useVideo.getState().lengthSeconds
            )
          }
          disabled={props.match.fromSeconds === undefined}
        >
          Autofill
        </Button>
      )}
      {(props.match.fromSeconds !== undefined ||
        props.match.toSeconds !== undefined) && (
        <Button
          secondary
          size="sm"
          onClick={() =>
            updateMatch(props.index, {
              fromSeconds: undefined,
              toSeconds: undefined,
            })
          }
        >
          Reset
        </Button>
      )}
    </li>
  );
}
