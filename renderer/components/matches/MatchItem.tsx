import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { useMemo } from 'react'
import {
  SplitterMatch,
  toggleMatchSelection,
  updateMatch,
  useMatches,
} from '../../state/useMatches'
import { seekSeconds, useVideo } from '../../state/useVideo'
import { MenuButton } from './MenuButton'
import { TimestampButton } from './TimestampButton'

export interface MatchItemProps {
  match: SplitterMatch
  index: number
}
const statuses = {
  new: 'text-gray-500 bg-gray-100/10',
  readyToSplit: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10',
}

const environments = {
  setTime: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  Production: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
}

export function MatchItem(props: MatchItemProps) {
  const selectedMatches = useMatches((state) => state.selectedMatchIds)
  const status = useMemo(() => {
    if (props.match.fromSeconds && props.match.toSeconds) {
      return 'readyToSplit'
    }
    return 'new'
  }, [props.match.fromSeconds, props.match.toSeconds])

  return (
    <li
      key={props.match.id}
      className={clsx(
        'relative flex items-center space-x-4 p-4 ',
        selectedMatches.includes(props.match.id)
          ? 'bg-gray-600/50 hover:bg-gray-600/70'
          : 'hover:bg-gray-600/20'
      )}
      onClick={() => toggleMatchSelection(props.match.id)}
    >
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-3">
          <div
            className={clsx(statuses[status], 'flex-none rounded-full p-1')}
            onClick={() => console.log('clicked match ', props.match.name)}
          >
            <div className="h-2 w-2 rounded-full bg-current" />
          </div>
          <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
            <div className="flex gap-x-2">
              <span className="truncate">{props.match.name}</span>
              <span className="text-gray-400">/</span>
              <span className="whitespace-nowrap font-light text-gray-400">
                {props.match.description}
              </span>
            </div>
          </h2>
        </div>
        <div className="mt-3 ml-6 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
          <div className="flex flex-row gap-4 align-middle items-center">
            <TimestampButton
              timestampSeconds={props.match.fromSeconds}
              onClick={() => {
                console.log(
                  `setting fromSeconds to ${useVideo.getState().currentSeconds}`
                )

                updateMatch(props.index, {
                  fromSeconds: useVideo.getState().currentSeconds,
                })
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
      <div
        className={clsx(
          environments.setTime,
          'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset'
        )}
      >
        TBD
      </div>
      {props.match.fromSeconds && (
        <div className="rounded-full bg-gray-400/10 hover:bg-gray-400/40">
          <ChevronRightIcon
            className="h-5 w-5 flex-none text-gray-400"
            aria-hidden="true"
            onClick={() => seekSeconds(props.match.fromSeconds)}
          />
        </div>
      )}
      <MenuButton match={props.match} />
    </li>
  )
}
