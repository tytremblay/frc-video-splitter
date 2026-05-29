import { BackwardIcon, ChevronLeftIcon, ChevronRightIcon, ForwardIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
import { useCallback, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { setCurrentSeconds, setVideoPath, useVideo } from '../../state/useVideo';
import clsx from 'clsx';
import { Button } from '@shared/components/ui/button';

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
      <button
        type="button"
        className="flex h-full min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:bg-muted/50"
        onClick={openFile}
      >
        <h2 className="text-2xl font-semibold text-foreground">Add Video</h2>
        <PlusCircleIcon className="h-20 w-20 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className={clsx('flex flex-col justify-start items-center p-4 transition-transform', hidden && 'w-0')}>
      {hidden ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setHidden(false)}>
          <ChevronRightIcon className="size-4" />
        </Button>
      ) : (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setHidden(true)}>
          <ChevronLeftIcon className="size-4" />
        </Button>
      )}
      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        <ReactPlayer
          url={video.path}
          controls={true}
          ref={playerRef}
          width='100%'
          height='100%'
          onProgress={(state) => setCurrentSeconds(state.playedSeconds)}
        />
      </div>
      {!hidden && (
        <div className='w-full flex flex-row justify-center gap-3 py-2'>
          {increments.map((increment) => (
            <Button
              key={`${increment}`}
              type="button"
              variant="outline"
              className="flex h-auto flex-col gap-1 py-2 font-normal"
              onClick={() =>
                playerRef.current?.seekTo(playerRef.current?.getCurrentTime() + increment, 'seconds')
              }
            >
              {increment < 0 ? <BackwardIcon className="h-6 w-6" /> : <ForwardIcon className="h-6 w-6" />}
              <span className="text-xs text-muted-foreground">{Math.abs(increment)}s</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
