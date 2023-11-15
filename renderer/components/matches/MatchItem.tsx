import { clsx } from 'clsx';
import { useMemo } from 'react';
import { SplitterMatch, updateMatch, useMatches } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { Badge } from '../badges/Badge';
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
      return 'Set Timestamps';
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
        'relative flex items-center space-x-4 p-4 ',
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
              onClick={() => {
                updateMatch(props.index, {
                  fromSeconds: useVideo.getState().currentSeconds,
                });
              }}
            />
            <span className="text-gray-400">to</span>
            <TimestampButton
              timestampSeconds={props.match.toSeconds}
              onClick={() =>
                updateMatch(props.index, {
                  toSeconds: useVideo.getState().currentSeconds,
                })
              }
            />
          </div>
        </div>
      </div>
      <Badge type={status === 'new' ? 'info' : 'success'} text={badgeText} />
    </li>
  );
}
