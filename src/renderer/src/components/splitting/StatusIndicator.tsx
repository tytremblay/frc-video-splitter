import { CheckIcon, TriangleAlertIcon } from 'lucide-react';
import type { MatchSplitStatus } from '../../state/useSplitOperation';

interface StatusIndicatorProps {
  status: MatchSplitStatus;
  progress?: number;
}

export function StatusIndicator({ status, progress }: StatusIndicatorProps) {
  if (status === 'split') return <CheckIcon className="size-3.5 shrink-0 text-emerald-500" />;
  if (status === 'warning') return <TriangleAlertIcon className="size-3.5 shrink-0 text-amber-500" />;
  if (status === 'splitting') {
    return (
      <div className="relative size-3.5 shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.5" fill="none" strokeWidth="1.5" className="stroke-border/40" />
          <circle
            cx="7" cy="7" r="5.5" fill="none" strokeWidth="1.5"
            className="stroke-primary transition-all duration-300"
            strokeDasharray={`${2 * Math.PI * 5.5}`}
            strokeDashoffset={`${2 * Math.PI * 5.5 * (1 - (progress ?? 0) / 100)}`}
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
  return <div className="size-1.5 rounded-full bg-primary shrink-0" />;
}
