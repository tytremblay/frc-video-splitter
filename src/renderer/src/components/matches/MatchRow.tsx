import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { SplitterMatch, addBlankMatch, updateMatch } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { TimestampButton } from './TimestampButton';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';

export interface MatchRowProps {
  match: SplitterMatch;
  index: number;
}

export function MatchRow(props: MatchRowProps) {
  return (
    <tr className="hover:bg-muted/50">
      <td className="py-2 lg:pl-8">
        <Textarea
          className="min-h-8 w-full whitespace-break-spaces"
          value={props.match.name}
          placeholder="Add name"
          onChange={(event) => updateMatch(props.index, { name: event.target.value })}
        />
      </td>
      <td className="py-2 lg:pl-3">
        <Textarea
          className="min-h-8 w-full whitespace-break-spaces"
          value={props.match.description}
          placeholder="Add description"
          onChange={(event) => updateMatch(props.index, { description: event.target.value })}
        />
      </td>
      <td className="py-2 lg:pl-3">
        <TimestampButton
          timestampSeconds={props.match.fromSeconds}
          onClick={() => updateMatch(props.index, { fromSeconds: useVideo.getState().currentSeconds })}
        />
      </td>
      <td className="py-2 lg:pl-3">
        <TimestampButton
          timestampSeconds={props.match.toSeconds}
          onClick={() => updateMatch(props.index, { toSeconds: useVideo.getState().currentSeconds })}
        />
      </td>
      <td className='py-2 lg:pl-3 flex flex-row gap-1 items-center align-middle h-full'>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="flex h-auto gap-0 px-1"
          onClick={() => addBlankMatch(props.index - 1)}
        >
          <PlusIcon className='h-4 w-4' />
          <ArrowUpIcon className='h-4 w-4' />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="flex h-auto gap-0 px-1"
          onClick={() => addBlankMatch(props.index + 1)}
        >
          <PlusIcon className='h-4 w-4' />
          <ArrowDownIcon className='h-4 w-4' />
        </Button>
      </td>
    </tr>
  );
}
