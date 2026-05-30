import { Button } from '@/components/ui/button';
import type { SplitFixedDetails } from '@shared/types';
import { FolderOpenIcon, ScissorsIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useMatches } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';

interface SplittingSectionProps {
  outputDir: string;
}

export function SplittingSection(props: SplittingSectionProps) {
  const matches = useMatches(state => state.matches);
  const video = useVideo();
  const [outputDir, setOutputDir] = useState<string>(props.outputDir);

  const openDir = useCallback(async () => {
    const dir = await window.ipc.openDirectory();
    setOutputDir(dir);
  }, []);

  const validMatches = matches.filter(match => !!match.fromSeconds && !!match.toSeconds);

  const handleSplit = useCallback(async () => {
    const details: SplitFixedDetails[] = validMatches.map(match => ({
      matchKey: match.name,
      inputFile: video.path,
      outputFile: `${outputDir}/${match.name}.mp4`,
      blocks: [{ startSeconds: match.fromSeconds, durationSeconds: match.toSeconds - match.fromSeconds }]
    }));

    await window.ipc.splitMatches(details);
  }, [outputDir, validMatches, video.path]);

  const canSplit = !!video.path && !!outputDir && validMatches.length > 0;

  return (
    <div className="flex flex-col rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Export
        </p>
        <p className="mt-0.5 text-sm font-medium">Split matches to files</p>
      </div>

      {/* Output folder */}
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Output folder
        </p>
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
        <p className="text-[10px] text-muted-foreground/50">
          Each match with timestamps becomes a separate .mp4 file here.
        </p>
      </div>

      {/* Footer — status + action */}
      <div className="border-t border-border/60 bg-muted/10 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`size-1.5 rounded-full ${validMatches.length > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{validMatches.length}</span>
            {' '}/ {matches.length} ready
          </span>
        </div>
        <Button
          type="button"
          disabled={!canSplit}
          onClick={handleSplit}
          size="sm"
          className="h-8"
        >
          <ScissorsIcon className="size-3.5" />
          Split {validMatches.length > 0 ? validMatches.length : ''} {validMatches.length === 1 ? 'match' : 'matches'}
        </Button>
      </div>
    </div>
  );
}
