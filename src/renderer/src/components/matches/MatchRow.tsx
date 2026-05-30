import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from 'lucide-react';
import { SplitterMatch, addBlankMatch, updateMatch } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { TimestampButton } from './TimestampButton';
import { Button } from '@/components/ui/button';

export interface MatchRowProps {
  match: SplitterMatch;
  index: number;
}

export function MatchRow(props: MatchRowProps) {
  const hasTimestamps = !!props.match.fromSeconds && !!props.match.toSeconds;

  return (
    <tr className="group border-b border-border/40 hover:bg-muted/20 transition-colors">
      <td className="py-2 pl-4 pr-3 align-middle sm:pl-6">
        <div className="flex items-center gap-2">
          <div className={`size-1.5 shrink-0 rounded-full ${hasTimestamps ? 'bg-primary' : 'bg-border/60'}`} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-0 border-0 p-0"
            value={props.match.name}
            placeholder="Match name"
            onChange={(event) => updateMatch(props.index, { name: event.target.value })}
          />
        </div>
      </td>
      <td className="hidden py-2 px-3 align-middle sm:table-cell">
        <input
          className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-0 border-0 p-0"
          value={props.match.description}
          placeholder="Optional description"
          onChange={(event) => updateMatch(props.index, { description: event.target.value })}
        />
      </td>
      <td className="py-2 px-3 align-middle">
        <TimestampButton
          timestampSeconds={props.match.fromSeconds}
          onClick={() => updateMatch(props.index, { fromSeconds: useVideo.getState().currentSeconds })}
        />
      </td>
      <td className="py-2 px-3 align-middle">
        <TimestampButton
          timestampSeconds={props.match.toSeconds}
          onClick={() => updateMatch(props.index, { toSeconds: useVideo.getState().currentSeconds })}
        />
      </td>
      <td className="py-2 px-3 align-middle">
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground/50 hover:text-foreground"
            onClick={() => addBlankMatch(props.index - 1)}
            title="Insert row above"
          >
            <PlusIcon className="size-3" />
            <ArrowUpIcon className="size-3 -ml-1.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground/50 hover:text-foreground"
            onClick={() => addBlankMatch(props.index + 1)}
            title="Insert row below"
          >
            <PlusIcon className="size-3" />
            <ArrowDownIcon className="size-3 -ml-1.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
