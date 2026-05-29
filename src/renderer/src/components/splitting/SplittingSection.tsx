import { useCallback, useState } from 'react';
import { Button } from '@shared/components/ui/button';
import { useMatches } from '../../state/useMatches';
import type { SplitFixedDetails } from '@shared/types';
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

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="text-xl font-semibold uppercase tracking-wide text-foreground">Splitting</div>
      <div className="flex flex-row gap-2 items-center">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-muted-foreground">Output Directory</div>
          <div className="text-sm text-foreground">{outputDir || 'Not set'}</div>
        </div>
        <Button variant="secondary" onClick={openDir}>
          Change
        </Button>
      </div>

      <Button variant="secondary" onClick={handleSplit}>
        Split {validMatches.length} Matches
      </Button>
    </div>
  );
}
