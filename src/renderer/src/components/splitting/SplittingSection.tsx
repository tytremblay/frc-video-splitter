import { Button } from '@/components/ui/button';
import type { SplitBlock, SplitFixedDetails } from '@shared/types';
import { CalendarDaysIcon, FolderOpenIcon, ScissorsIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useEvent } from '../../state/useEvent';
import { type SplitterMatch, useMatches } from '../../state/useMatches';
import { useSettings } from '../../state/useSettings';
import { type MatchSplitStatus, useSplitOperation } from '../../state/useSplitOperation';
import { useVideo } from '../../state/useVideo';
import { FileConflictDialog } from './FileConflictDialog';
import { MatchListItem } from './MatchListItem';

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

function deriveStatus(match: SplitterMatch, durationSeconds: number): 'ready' | 'warning' {
  if (match.fromSeconds! < 0 || match.toSeconds! > durationSeconds) return 'warning';
  return 'ready';
}

interface SplittingSectionProps {
  outputDir: string;
  onOpenEventDialog: () => void;
}

export function SplittingSection(props: SplittingSectionProps) {
  const eventName = useEvent(state => state.name);
  const matches = useMatches(state => state.matches);
  const video = useVideo();
  const settings = useSettings();
  const [outputDir, setOutputDir] = useState<string>(props.outputDir);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [pendingSplit, setPendingSplit] = useState<{
    details: SplitFixedDetails[];
    initialStatusMap: Map<string, MatchSplitStatus>;
    conflictingPaths: string[];
  } | null>(null);
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

  const runSplit = useCallback(async (details: SplitFixedDetails[], initialStatusMap: Map<string, MatchSplitStatus>) => {
    const conflictingPaths = await window.ipc.checkFilesExist(details.map(d => d.outputFile));
    if (conflictingPaths.length === 0) {
      await start(details, initialStatusMap);
    } else {
      setPendingSplit({ details, initialStatusMap, conflictingPaths });
    }
  }, [start]);

  const handleSplit = useCallback(async () => {
    const details: SplitFixedDetails[] = visibleMatches.map(match => ({
      matchKey: match.id,
      inputFile: video.path,
      outputFile: `${outputDir}/${match.name}.mp4`,
      blocks: buildBlocks(match, settings),
    }));
    const initialStatusMap = new Map(visibleMatches.map(m => [m.id, deriveStatus(m, video.durationSeconds)]));
    await runSplit(details, initialStatusMap);
  }, [outputDir, visibleMatches, video.path, video.durationSeconds, settings, runSplit]);

  const handleSplitMatch = useCallback(async (match: SplitterMatch) => {
    const details: SplitFixedDetails[] = [{
      matchKey: match.id,
      inputFile: video.path,
      outputFile: `${outputDir}/${match.name}.mp4`,
      blocks: buildBlocks(match, settings),
    }];
    const initialStatusMap = new Map([[match.id, deriveStatus(match, video.durationSeconds)]]);
    await runSplit(details, initialStatusMap);
  }, [outputDir, video.path, video.durationSeconds, settings, runSplit]);

  const handleConflictReplace = useCallback(async () => {
    if (!pendingSplit) return;
    setPendingSplit(null);
    await start(pendingSplit.details, pendingSplit.initialStatusMap);
  }, [pendingSplit, start]);

  const handleConflictSkip = useCallback(async () => {
    if (!pendingSplit) return;
    const conflictSet = new Set(pendingSplit.conflictingPaths);
    const details = pendingSplit.details.filter(d => !conflictSet.has(d.outputFile));
    const initialStatusMap = new Map(
      [...pendingSplit.initialStatusMap].filter(([key]) => details.some(d => d.matchKey === key))
    );
    setPendingSplit(null);
    await start(details, initialStatusMap);
  }, [pendingSplit, start]);

  const handleConflictCancel = useCallback(() => {
    setPendingSplit(null);
  }, []);

  const canSplit = !!video.path && !!outputDir && visibleMatches.length > 0;
  const splitCount = [...statusMap.values()].filter(s => s === 'split').length;
  const readyCount = visibleMatches.filter(m => {
    const s = statusMap.get(m.id);
    return s == null ? deriveStatus(m, video.durationSeconds) === 'ready' : s === 'ready';
  }).length;

  return (
    <div className="relative flex flex-col h-full rounded-lg border border-border/60 bg-card overflow-hidden">
      {!eventName && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/80 backdrop-blur-sm p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full border border-border/40 bg-muted/40">
            <CalendarDaysIcon className="size-5 text-muted-foreground/75" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">No event selected</p>
            <p className="text-xs text-muted-foreground/80 max-w-[18rem] leading-relaxed">
              Select an event to load matches and enable splitting.
            </p>
          </div>
          <Button type="button" size="sm" onClick={props.onOpenEventDialog}>
            Select event
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Export</p>
        <p className="mt-0.5 text-sm font-medium">Split matches to files</p>
      </div>

      {/* Output folder */}
      <div className="px-4 py-3 space-y-1.5 border-b border-border/60">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/85">Output folder</p>
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="min-h-8 flex-1 truncate rounded-md border border-border/60 bg-background/40 px-3 py-1.5 font-mono text-xs text-foreground/70"
            title={outputDir || undefined}
          >
            {outputDir || <span className="text-muted-foreground/70">Not selected</span>}
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
            <p className="text-xs text-muted-foreground/75">
              {video.path
                ? 'Align the video bar on the timeline to set match timestamps.'
                : 'Load a video and align it on the timeline to populate matches.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {visibleMatches.map((match) => (
              <MatchListItem
                key={match.id}
                match={match}
                status={statusMap.get(match.id) ?? deriveStatus(match, video.durationSeconds)}
                progress={progressMap.get(match.id)}
                outputFile={outputFileMap.get(match.id)}
                isExpanded={expandedIds.has(match.id)}
                onToggleExpanded={() => toggleExpanded(match.id)}
                onSplitMatch={() => handleSplitMatch(match)}
                canSplit={!!outputDir && !!video.path}
                videoDurationSeconds={video.durationSeconds}
              />
            ))}
          </ul>
        )}
      </div>

      <FileConflictDialog
        open={pendingSplit !== null}
        conflictingPaths={pendingSplit?.conflictingPaths ?? []}
        totalCount={pendingSplit?.details.length ?? 0}
        onReplace={handleConflictReplace}
        onSkip={handleConflictSkip}
        onCancel={handleConflictCancel}
      />

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
