import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SplitBlock, SplitFixedDetails } from '@shared/types';
import { CheckIcon, ChevronDownIcon, FolderOpenIcon, ScissorsIcon, TriangleAlertIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useMatches, type SplitterMatch } from '../../state/useMatches';
import { useSettings } from '../../state/useSettings';
import { useSplitOperation, type MatchSplitStatus } from '../../state/useSplitOperation';
import { useVideo } from '../../state/useVideo';

function buildBlocks(
  match: SplitterMatch,
  settings: ReturnType<typeof useSettings.getState>
): SplitBlock[] {
  const { startPaddingSeconds, endPaddingSeconds, matchLengthSeconds, resultsLengthSeconds, clipDeadAir, deadAirThresholdSeconds } = settings;

  const matchStart = match.fromSeconds! - startPaddingSeconds;
  const matchEnd = match.fromSeconds! + matchLengthSeconds + endPaddingSeconds;
  const resultsStart = match.toSeconds! - startPaddingSeconds;
  const resultsEnd = match.toSeconds! + resultsLengthSeconds + endPaddingSeconds;

  const gap = resultsStart - matchEnd;

  if (clipDeadAir && gap > deadAirThresholdSeconds) {
    return [
      { startSeconds: matchStart, durationSeconds: matchEnd - matchStart },
      { startSeconds: resultsStart, durationSeconds: resultsEnd - resultsStart },
    ];
  }

  return [{ startSeconds: matchStart, durationSeconds: resultsEnd - matchStart }];
}

function formatTimestamp(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function deriveStatus(match: SplitterMatch, durationSeconds: number): 'ready' | 'warning' {
  if (match.fromSeconds! < 0 || match.toSeconds! > durationSeconds) return 'warning'
  return 'ready'
}

function warningReason(match: SplitterMatch, durationSeconds: number): string {
  const reasons: string[] = []
  if (match.fromSeconds! < 0) reasons.push(`starts ${formatTimestamp(-match.fromSeconds!)} before video`)
  if (match.toSeconds! > durationSeconds) reasons.push(`ends ${formatTimestamp(match.toSeconds! - durationSeconds)} after video`)
  return reasons.join(' · ')
}

interface SplittingSectionProps {
  outputDir: string;
}

export function SplittingSection(props: SplittingSectionProps) {
  const matches = useMatches(state => state.matches);
  const video = useVideo();
  const settings = useSettings();
  const [outputDir, setOutputDir] = useState<string>(props.outputDir);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { statusMap, progressMap, outputFileMap, start } = useSplitOperation();

  const openDir = useCallback(async () => {
    const dir = await window.ipc.openDirectory();
    setOutputDir(dir);
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const visibleMatches = matches.filter(match =>
    match.fromSeconds != null &&
    match.toSeconds != null &&
    match.fromSeconds < video.durationSeconds &&
    match.toSeconds > 0
  );

  const handleSplit = useCallback(async () => {
    const details: SplitFixedDetails[] = visibleMatches.map(match => ({
      matchKey: match.id,
      inputFile: video.path,
      outputFile: `${outputDir}/${match.name}.mp4`,
      blocks: buildBlocks(match, settings),
    }));
    const initialStatusMap = new Map(visibleMatches.map(m => [m.id, deriveStatus(m, video.durationSeconds)]));
    await start(details, initialStatusMap);
  }, [outputDir, visibleMatches, video.path, video.durationSeconds, settings, start]);

  const canSplit = !!video.path && !!outputDir && visibleMatches.length > 0;
  const splitCount = [...statusMap.values()].filter(s => s === 'split').length;
  const readyCount = visibleMatches.filter(m => {
    const s = statusMap.get(m.id);
    return s == null ? deriveStatus(m, video.durationSeconds) === 'ready' : s === 'ready';
  }).length;

  return (
    <div className="flex flex-col rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Export</p>
        <p className="mt-0.5 text-sm font-medium">Split matches to files</p>
      </div>

      {/* Output folder */}
      <div className="px-4 py-3 space-y-1.5 border-b border-border/60">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Output folder</p>
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="min-h-8 flex-1 truncate rounded-md border border-border/60 bg-background/40 px-3 py-1.5 font-mono text-xs text-foreground/70"
            title={outputDir || undefined}
          >
            {outputDir || <span className="text-muted-foreground/50">Not selected</span>}
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0 h-8 border-border/60" onClick={openDir}>
            <FolderOpenIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Match list */}
      <div className="flex-1 overflow-y-auto">
        {visibleMatches.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground/50">
              {video.path
                ? 'Align the video bar on the timeline to set match timestamps.'
                : 'Load a video and align it on the timeline to populate matches.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {visibleMatches.map((match) => {
              const status = statusMap.get(match.id) ?? deriveStatus(match, video.durationSeconds);
              const progress = progressMap.get(match.id);
              const outputFile = outputFileMap.get(match.id);
              const isExpanded = expandedIds.has(match.id);

              return (
                <li key={match.id} className="divide-y divide-border/30">
                  {/* Summary row */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(match.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
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

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-muted/10 space-y-2.5">
                      {status === 'warning' && (
                        <DetailRow label="Warning" valueClassName="text-amber-500">
                          {warningReason(match, video.durationSeconds)}
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
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 bg-muted/10 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`size-1.5 rounded-full ${visibleMatches.length > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          <span className="text-xs text-muted-foreground tabular-nums">
            {splitCount > 0
              ? <><span className="font-semibold text-foreground">{splitCount}</span> / {visibleMatches.length} done</>
              : <><span className="font-semibold text-foreground">{readyCount}</span> / {visibleMatches.length} ready</>
            }
          </span>
        </div>
        <Button type="button" disabled={!canSplit} onClick={handleSplit} size="sm" className="h-8">
          <ScissorsIcon className="size-3.5" />
          Split {visibleMatches.length > 0 ? visibleMatches.length : ''} {visibleMatches.length === 1 ? 'match' : 'matches'}
        </Button>
      </div>
    </div>
  );
}

function StatusIndicator({ status, progress }: { status: MatchSplitStatus; progress?: number }) {
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

function DetailRow({ label, children, valueClassName }: { label: string; children: React.ReactNode; valueClassName?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 shrink-0 w-12 pt-px">{label}</span>
      <span className={cn('text-[10px] text-muted-foreground/80 min-w-0', valueClassName)}>{children}</span>
    </div>
  );
}
