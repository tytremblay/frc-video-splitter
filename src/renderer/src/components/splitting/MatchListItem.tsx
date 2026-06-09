import { cn } from '@/lib/utils';
import { ChevronDownIcon, ScissorsIcon } from 'lucide-react';
import type { SplitterMatch } from '../../state/useMatches';
import type { MatchSplitStatus } from '../../state/useSplitOperation';
import { DetailRow } from './DetailRow';
import { StatusIndicator } from './StatusIndicator';

function formatTimestamp(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function warningReason(match: SplitterMatch, durationSeconds: number): string {
  const reasons: string[] = [];
  if (match.fromSeconds! < 0) reasons.push(`starts ${formatTimestamp(-match.fromSeconds!)} before video`);
  if (match.toSeconds! > durationSeconds) reasons.push(`ends ${formatTimestamp(match.toSeconds! - durationSeconds)} after video`);
  return reasons.join(' · ');
}

export interface MatchListItemProps {
  match: SplitterMatch;
  status: MatchSplitStatus;
  progress: number | undefined;
  outputFile: string | undefined;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onSplitMatch: () => void;
  canSplit: boolean;
  videoDurationSeconds: number;
}

export function MatchListItem({ match, status, progress, outputFile, isExpanded, onToggleExpanded, onSplitMatch, canSplit, videoDurationSeconds }: MatchListItemProps) {
  return (
    <li className="divide-y divide-border/30">
      {/* Summary row */}
      <div className="flex items-stretch divide-x divide-border/30">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex-1 flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors min-w-0"
        >
          <StatusIndicator status={status} progress={progress} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{match.name}</p>
            {match.description && (
              <p className="text-[10px] text-muted-foreground/60 truncate">{match.description}</p>
            )}
          </div>
          <div className="shrink-0 text-right mr-1">
            <p className="font-mono text-[10px] text-muted-foreground/70 tabular-nums">
              {formatTimestamp(match.fromSeconds!)}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/40 tabular-nums">
              {formatTimestamp(match.toSeconds!)}
            </p>
          </div>
          <ChevronDownIcon className={cn(
            'size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-150',
            isExpanded && 'rotate-180'
          )} />
        </button>
        <button
          type="button"
          disabled={!canSplit || status === 'splitting'}
          onClick={onSplitMatch}
          className="shrink-0 flex items-center justify-center px-3 text-muted-foreground/40 hover:bg-muted/30 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Split this match"
        >
          <ScissorsIcon className="size-3.5" />
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 py-3 bg-muted/10 space-y-2.5">
          {status === 'warning' && (
            <DetailRow label="Warning" valueClassName="text-amber-500">
              {warningReason(match, videoDurationSeconds)}
            </DetailRow>
          )}
          {status === 'splitting' && progress != null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Progress</span>
                <span className="font-mono text-[10px] text-muted-foreground/70">{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-full bg-border/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {outputFile && (
            <DetailRow label="Output">
              <span className="font-mono break-all">{outputFile}</span>
            </DetailRow>
          )}
          <DetailRow label="Start">{formatTimestamp(match.fromSeconds!)}</DetailRow>
          <DetailRow label="End">{formatTimestamp(match.toSeconds!)}</DetailRow>
        </div>
      )}
    </li>
  );
}
