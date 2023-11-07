import { BackwardIcon, ChevronLeftIcon, ChevronRightIcon, ForwardIcon, MinusCircleIcon, MinusIcon, PlusCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useCallback, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { setCurrentSeconds, setVideoPath, useVideo } from '../../state/useVideo';
import clsx from 'clsx';

const increments = [-600, -135, -30, -5, 5, 30, 135, 600];

interface VideoPlayerProps {
  hidden?: boolean;
}

export function VideoPlayer(props: VideoPlayerProps) {
  const [hidden, setHidden] = useState(props.hidden);
  const video = useVideo();
  const playerRef = useRef<ReactPlayer>(null);

  const openFile = useCallback(async () => {
    const file = await window.ipc.openFile();
    setVideoPath(file);
  }, []);


  if (!video.path) {
    return (
      <div className='h-full border border-gray-600 rounded-lg flex flex-col justify-center items-center hover:bg-gray-600' onClick={openFile}>
        <h2 className='text-2xl'>Add Video</h2>
        <PlusCircleIcon className='h-20 w-20' />
      </div>);
  }

  return (
    <div className={clsx('flex flex-col justify-start items-center p-4 transition-transform', hidden && 'w-0')}>
      {hidden ? <ChevronRightIcon className='w-4 h-4 rounded-full hover:bg-gray-500' onClick={() => setHidden(false)} /> : <ChevronLeftIcon className='w-4 h-4 rounded-full hover:bg-gray-500' onClick={() => setHidden(true)} />}
      <div className='rounded overflow-hidden shadow-md'>
        <ReactPlayer url={video.path} controls={true} ref={playerRef} width='100%' height='100%' onProgress={(state) => setCurrentSeconds(state.playedSeconds)} />
      </div>
      {!hidden &&
        <div className='w-full flex flex-row justify-center gap-3 py-2'>
          {increments.map((increment) => {
            return (
              <div key={`${increment}`} className='flex flex-col justify-center items-center gap-1 hover:bg-blue-500 rounded-lg p-2 shadow-sm'
                onClick={() => playerRef.current?.seekTo(playerRef.current?.getCurrentTime() + increment, 'seconds')}>
                {increment < 0 ? <BackwardIcon className='h-6 w-6' /> : <ForwardIcon className='h-6 w-6' />}
                <div className='text-sm'>{Math.abs(increment)}s</div>
              </div>
            );
          })}
        </div>}
    </div>

  );
}