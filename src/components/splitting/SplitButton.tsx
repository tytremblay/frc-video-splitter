import { outputDirectory, separateMatchResults } from '@/state';
import { useCallback } from 'react';
import { SplitFixedDetails } from '../../../electron/helpers/ffmpegCommands';
import { useMatches } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { Button } from '../buttons';

export function SplitButton() {
  const matches = useMatches((state) => state.matches);
  const video = useVideo();

  const validMatches = matches.filter(
    (match) => {
      const hasMatchTimes = match.fromSeconds !== undefined && match.toSeconds !== undefined;
      const hasResultsTimes = match.toResultsSeconds !== undefined && match.fromResultsSeconds !== undefined;
      return hasMatchTimes && (separateMatchResults.value ? hasResultsTimes : true);
    }
  );

  const handleSplit = useCallback(async () => {
    const details: SplitFixedDetails[] = validMatches.map((match) => {
      const blocks = [
        {
          startSeconds: match.fromSeconds!,
          durationSeconds: match.toSeconds! - match.fromSeconds!,
        },
      ]
      if (separateMatchResults.value) {
        blocks.push({
          startSeconds: match.fromResultsSeconds!,
          durationSeconds: match.toResultsSeconds! - match.fromResultsSeconds!,
        })
      }
      const details: SplitFixedDetails = {
        id: match.id,
        inputFile: video.path,
        outputDirectory: outputDirectory.value,
        outputFileName: `${match.name}.mp4`,
        blocks
      };
      return details;
    });
    await window.ipc.splitMatches(details);
  }, [outputDirectory.value, validMatches, video.path]);
  return (
    <Button
      size="xl"
      onClick={handleSplit}
      disabled={validMatches.length === 0 || !outputDirectory.value}
    >
      {`Split ${validMatches.length} Match${validMatches.length !== 1 ? 'es' : ''
        }`}
    </Button>
  );
}
