import { separateMatchResults } from '@/state';
import { Popover, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { Fragment, useMemo } from 'react';
import {
  SplitterMatch,
  autoFillTimeStamps,
  removeMatch,
  updateMatch,
  useMatches,
} from '../../state/useMatches';
import { seekSeconds, useVideo } from '../../state/useVideo';
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

  const autofillTime = separateMatchResults.value ? props.match.startSeconds : props.match.fromSeconds;

  return (
    <li
      key={props.match.id}
      className={clsx(
        'flex items-center space-x-4 p-2',
        selectedMatches.includes(props.match.id)
          ? 'bg-gray-600/50 hover:bg-gray-600/70'
          : 'hover:bg-gray-600/20'
      )}
    >
      <div className="min-w-0 flex-auto flex flex-row gap-2 justify-between items-center">
        <div className="flex flex-col items-start gap-2">
          <MatchTitle match={props.match} index={props.index} />
          <MatchDescription match={props.match} index={props.index} />
        </div>
        <div className="flex flex-col gap-2 text-xs leading-5 text-gray-400">
          <div className="flex flex-row gap-2 align-middle items-center">
            {separateMatchResults.value ? <>
              <span>Match Start:</span>
              <TimestampButton
                timestampSeconds={props.match.startSeconds}
                onSet={() => {
                  updateMatch(props.index, {
                    startSeconds: useVideo.getState().currentSeconds,
                  });
                }}
                onSeek={() =>
                  props.match.startSeconds && seekSeconds(props.match.startSeconds)
                }
              />
              <span>Match:</span>
            </> : ''}
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

          {separateMatchResults.value ? <div className="flex flex-row gap-2 align-middle items-center">
            <span>Results:</span>
            <TimestampButton
              timestampSeconds={props.match.fromResultsSeconds}
              onSet={() => {
                updateMatch(props.index, {
                  fromResultsSeconds: useVideo.getState().currentSeconds,
                });
              }}
              onSeek={() =>
                props.match.fromResultsSeconds && seekSeconds(props.match.fromResultsSeconds)
              }
            />
            <span className="text-gray-400">to</span>
            <TimestampButton
              timestampSeconds={props.match.toResultsSeconds}
              onSet={() =>
                updateMatch(props.index, {
                  toResultsSeconds: useVideo.getState().currentSeconds,
                })
              }
              onSeek={() =>
                props.match.toResultsSeconds && seekSeconds(props.match.toResultsSeconds)
              }
            />
          </div> : null}
        </div>
      </div>
      {
        props.match.startTime && props.match.resultsTime && (
          <Button
            secondary
            size="sm"
            onClick={() =>
              autofillTime &&
              autoFillTimeStamps(
                props.index,
                autofillTime,
                useVideo.getState().lengthSeconds
              )
            }
            disabled={autofillTime === undefined}
          >
            Autofill
          </Button>
        )
      }
      <Popover className="relative">
        <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
          <EllipsisVerticalIcon
            className="h-5 w-5 text-gray-500"
            aria-hidden="true"
          />
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute z-10 flex w-screen max-w-min -translate-x-full">
            <div className="w-24 shrink rounded-md bg-gray-400 text-sm font-semibold leading-6 text-gray-900 overflow-clip">
              <button
                key={'reset_match'}
                className="block p-2 hover:text-indigo-600 hover:bg-gray-500 w-full"
                onClick={() =>
                  updateMatch(props.index, {
                    fromSeconds: undefined,
                    toSeconds: undefined,
                    startSeconds: undefined,
                    fromResultsSeconds: undefined,
                    toResultsSeconds: undefined,
                  })
                }
              >
                Reset
              </button>
              <button
                key={'delete_match'}
                className="block p-2 hover:text-indigo-600 hover:bg-gray-500 w-full"
                onClick={() => removeMatch(props.match.id)}
              >
                Delete
              </button>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </li >
  );
}
