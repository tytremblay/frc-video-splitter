import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import { SplitFixedDetails } from '../../../main/helpers/ffmpegCommands';
import { useMatches } from '../../state/useMatches';
import { useVideo } from '../../state/useVideo';
import { Badge } from '../badges/Badge';
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
    <div className="lg:col-start-3 lg:row-end-1 ">
      <div className="rounded-lg ring-1 ring-white/20">
        <dl className="flex flex-wrap">
          <div className="flex-auto pl-6 pt-6">
            <dt className="text-sm font-semibold leading-6 text-white">
              Splitting Summary
            </dt>
          </div>
          <div className="flex-none self-end px-6 pt-4">
            <Badge
              type={validMatches.length > 0 ? 'success' : 'info'}
              text={`${validMatches.length} Match${
                validMatches.length !== 1 ? 'es' : ''
              } Ready`}
            />
          </div>
          <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-white/20 px-6 pt-6">
            <dt className="flex-none">
              <FolderOpenIcon
                className="h-6 w-5 text-gray-400"
                aria-hidden="true"
              />
            </dt>
            <dd className="text-sm font-medium leading-6 text-white">
              {outputDir}
            </dd>
            <Button size="sm" secondary={!!outputDir} onClick={openDir}>
              {outputDir ? 'Change' : 'Select'}
            </Button>
          </div>
        </dl>
        <div className="mt-6 border-t border-white/20 px-6 py-6">
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
