import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import { SplitFixedDetails } from '../../../main/helpers/ffmpegCommands';
import { useMatches } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { Button } from '../buttons';

export function SplittingSection() {
  const matches = useMatches((state) => state.matches);
  const video = useVideo();
  const [outputDir, setOutputDir] = useState<string | undefined>(undefined);

  const openDir = useCallback(async () => {
    const dir = await window.ipc.openDirectory();
    setOutputDir(dir);
  }, []);

  const validMatches = matches.filter(
    (match) => match.fromSeconds !== undefined && match.toSeconds !== undefined
  );

  const handleSplit = useCallback(async () => {
    const details: SplitFixedDetails[] = validMatches.map((match) => ({
      id: match.id,
      inputFile: video.path,
      outputFile: `${outputDir}\\${match.name}.mp4`,
      blocks: [
        {
          startSeconds: match.fromSeconds,
          durationSeconds: match.toSeconds - match.fromSeconds,
        },
      ],
    }));

    console.log('splitting', details);
    await window.ipc.splitMatches(details);
  }, [outputDir, validMatches, video.path]);
  return (
    <div className="lg:col-start-3 lg:row-end-1 m-1 ">
      <div className="rounded-lg">
        <div className="flex flex-row justify-between p-6 items-center">
          <div className="flex flex-row gap-2">
            <FolderOpenIcon
              className="h-6 w-5 text-gray-400"
              aria-hidden="true"
            />
            <dd className="text-sm font-medium leading-6 text-white">
              {outputDir}
            </dd>
            <Button size="sm" secondary={!!outputDir} onClick={openDir}>
              {outputDir ? 'Change' : 'Select Output Directory'}
            </Button>
          </div>
          <Button
            size="xl"
            onClick={handleSplit}
            disabled={validMatches.length === 0 || !outputDir}
          >
            {`Split ${validMatches.length} Match${
              validMatches.length !== 1 ? 'es' : ''
            }`}
          </Button>
        </div>
      </div>
    </div>
  );
}
