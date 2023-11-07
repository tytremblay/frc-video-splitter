import { useCallback, useState } from 'react';
import { useMatches } from '../../state/useMatches';
import { SplitFixedDetails } from '../../../main/helpers/ffmpegCommands';
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
      outputFile: `${outputDir}\\${match.name}.mp4`,
      blocks: [{ startSeconds: match.fromSeconds, durationSeconds: match.toSeconds - match.fromSeconds }]

    }));

    console.log('splitting', details);
    await window.ipc.splitMatches(details);
  }, [outputDir, validMatches, video.path]);
  return (
    <div className='rounded border border-gray-400 p-2'>
      <div className='text-xl font-white uppercase'>Splitting</div>
      <div className='flex flex-row gap-2 items-center'>
        <div className='flex flex-col gap-1'>
          <div className='text-sm text-gray-300'>Output Directory</div>
          <div className='text-sm text-gray-300'>{outputDir}</div>
        </div>
        <button className='rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20'
          onClick={openDir}>
          Change
        </button>
      </div>

      <button className='rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20'
        onClick={handleSplit}>
        Split {validMatches.length} Matches
      </button>
    </div>
  );
}