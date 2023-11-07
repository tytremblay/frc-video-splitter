import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { SplitterMatch, addBlankMatch, updateMatch } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { TimestampButton } from './TimestampButton';

export interface MatchRowProps {
  match: SplitterMatch;
  index: number;
}
export function MatchRow(props: MatchRowProps) {

  return (

    <tr className='hover:bg-white/5'>
      <td className="py-2 lg:pl-8">
        <textarea
          className='bg-transparent border-none w-full whitespace-break-spaces'
          value={props.match.name}
          placeholder='Add name'
          onChange={(event) => updateMatch(props.index, { name: event.target.value })} />

      </td>
      <td className="py-2 lg:pl-3">
        <textarea
          className='bg-transparent border-none w-full whitespace-break-spaces'
          value={props.match.description}
          placeholder='Add description'
          onChange={(event) => updateMatch(props.index, { description: event.target.value })} />
      </td>
      <td className="py-2 lg:pl-3">
        <TimestampButton timestampSeconds={props.match.fromSeconds} onClick={() => updateMatch(props.index, { fromSeconds: useVideo.getState().currentSeconds })} />
      </td>
      <td className="py-2 lg:pl-3">
        <TimestampButton timestampSeconds={props.match.toSeconds} onClick={() => updateMatch(props.index, { toSeconds: useVideo.getState().currentSeconds })} />
      </td>
      <td className='py-2 lg:pl-3 flex flex-row gap-1 items-center align-middle h-full'>
        <button onClick={() => addBlankMatch(props.index - 1)} className='p-1 rounded-sm hover:bg-gray-700 flex '>
          <PlusIcon className='h-4 w-4' />
          <ArrowUpIcon className='h-4 w-4' />
        </button>
        <button onClick={() => addBlankMatch(props.index + 1)} className='p-1 rounded-sm hover:bg-gray-700 flex '>
          <PlusIcon className='h-4 w-4' />
          <ArrowDownIcon className='h-4 w-4' />
        </button>
      </td>
    </tr>
  );
}