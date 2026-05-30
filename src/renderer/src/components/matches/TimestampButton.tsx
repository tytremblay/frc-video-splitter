import { ClockIcon } from 'lucide-react';
import { Duration } from "luxon";

interface TimestampButtonProps {
  timestampSeconds: number | undefined;
  onClick?: () => void;
}

export function TimestampButton(props: TimestampButtonProps) {
  const hasValue = props.timestampSeconds !== undefined;
  const label = hasValue
    ? Duration.fromMillis(props.timestampSeconds * 1000).toFormat('hh:mm:ss')
    : null;

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`
        group inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs
        transition-all duration-150 cursor-pointer select-none
        ${hasValue
          ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60'
          : 'border-border/50 bg-background/40 text-muted-foreground/60 hover:border-primary/30 hover:text-muted-foreground hover:bg-muted/30'
        }
      `}
    >
      <ClockIcon className={`size-3 shrink-0 transition-colors ${hasValue ? 'text-primary/70' : 'text-muted-foreground/40 group-hover:text-muted-foreground/60'}`} />
      <span className="tabular-nums tracking-wider">
        {hasValue ? label : '—:——:——'}
      </span>
    </button>
  );
}
