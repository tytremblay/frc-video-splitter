import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  FastForwardIcon,
  FileVideoIcon,
  FolderOpenIcon,
  RewindIcon,
} from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { setCurrentSeconds, setVideoDuration, setVideoPath, useVideo } from '../../state/useVideo';

function formatTimeOfDay(unixSecs: number) {
  return new Date(unixSecs * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

const SEEK_BACK = [-600, -135, -30, -5] as const;
const SEEK_FORWARD = [5, 30, 135, 600] as const;

function formatTimestamp(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatSeekLabel(seconds: number) {
  const abs = Math.abs(seconds);
  if (abs >= 60) return `${abs / 60}m`;
  return `${abs}s`;
}

function basename(path: string) {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export function VideoPlayer() {
  const video = useVideo();
  const playerRef = useRef<ReactPlayer>(null);

  const openFile = useCallback(async () => {
    const file = await window.ipc.openFile();
    setVideoPath(file);
  }, []);

  const seekBy = useCallback((increment: number) => {
    const current = playerRef.current?.getCurrentTime() ?? 0;
    playerRef.current?.seekTo(current + increment, 'seconds');
  }, []);

  const fileName = useMemo(
    () => (video.path ? basename(video.path) : ''),
    [video.path],
  );

  const fileUrl = useMemo(
    () => video.path ? encodeURI(`file://${video.path}`) : '',
    [video.path],
  );

  if (!video.path) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 bg-card/50 p-8 text-center md:min-h-56">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted ring-1 ring-border/60">
          <FileVideoIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">No video loaded</p>
          <p className="text-xs text-muted-foreground max-w-[18rem]">
            Select a recording to preview, scrub, and mark match start and end times.
          </p>
        </div>
        <Button type="button" onClick={openFile} size="sm" className="mt-1">
          <FolderOpenIcon />
          Select video
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Source
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground" title={video.path}>
            {fileName}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={openFile} className="h-7 text-xs">
            <FolderOpenIcon className="size-3" />
            Change
          </Button>
        </div>
      </div>

      {/* Video */}
      <div className="aspect-video overflow-hidden bg-black">
        <ReactPlayer
          url={fileUrl}
          controls
          ref={playerRef}
          width="100%"
          height="100%"
          onProgress={(state) => setCurrentSeconds(state.playedSeconds)}
          onDuration={setVideoDuration}
        />
      </div>

      {/* Seek + timestamp controls — single row */}
      <div className="border-t border-border/60 bg-muted/20 px-4 py-3 flex items-center gap-2">
        {/* Back seek */}
        <ButtonGroup className="shrink-0">
          {SEEK_BACK.map((increment) => (
            <Button
              key={increment}
              type="button"
              variant="outline"
              size="sm"
              className="min-w-11 flex-col gap-0.5 py-1.5 h-auto border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => seekBy(increment)}
            >
              <RewindIcon className="size-3.5" />
              <span className="font-mono text-[10px] leading-none">
                {formatSeekLabel(increment)}
              </span>
            </Button>
          ))}
        </ButtonGroup>

        {/* Timestamps — centered between seek groups */}
        <div className="flex flex-1 items-center justify-center gap-2 min-w-0">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Playback
            </span>
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-1.5">
              <div className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              <span className="font-mono text-base font-medium tabular-nums text-foreground tracking-widest">
                {formatTimestamp(video.currentSeconds)}
              </span>
            </div>
          </div>
          {video.videoTimelineOffsetSecs !== null && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-sky-600/70 dark:text-sky-400/70">
                Event time
              </span>
              <div className="flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/5 px-3 py-1.5">
                <div className="size-1.5 rounded-full bg-sky-500/60 shrink-0" />
                <span className="font-mono text-base tabular-nums text-sky-600 dark:text-sky-400">
                  {formatTimeOfDay(video.videoTimelineOffsetSecs + video.currentSeconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Forward seek */}
        <ButtonGroup className="shrink-0">
          {SEEK_FORWARD.map((increment) => (
            <Button
              key={increment}
              type="button"
              variant="outline"
              size="sm"
              className="min-w-11 flex-col gap-0.5 py-1.5 h-auto border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => seekBy(increment)}
            >
              <FastForwardIcon className="size-3.5" />
              <span className="font-mono text-[10px] leading-none">
                {formatSeekLabel(increment)}
              </span>
            </Button>
          ))}
        </ButtonGroup>
      </div>
    </div>
  );
}
