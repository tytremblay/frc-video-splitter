import clsx from 'clsx'
import { useCallback, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { setCurrentSeconds, setVideoPath, useVideo } from '../../state/useVideo'
import AddVideo from './AddVideo'
import { SeekButtons } from './SeekButtons'

export function VideoPlayer() {
  const video = useVideo()
  const playerRef = useRef<ReactPlayer>(null)

  const openFile = useCallback(async () => {
    const file = await window.ipc.openFile()
    setVideoPath(file)
  }, [])

  useEffect(() => {
    playerRef.current?.seekTo(video.seekSeconds, 'seconds')
  }, [video.seekSeconds])

  return (
    <div
      className={clsx(
        'flex flex-col justify-start items-center p-4 transition-transform aspect-video'
      )}
    >
      {video.path ? (
        <div className="rounded-lg flex flex-col justify-center items-center w-full overflow-clip">
          <ReactPlayer
            url={video.path}
            controls={true}
            ref={playerRef}
            width="100%"
            height="100%"
            onProgress={(state) => setCurrentSeconds(state.playedSeconds)}
          />
        </div>
      ) : (
        <AddVideo onClick={openFile} />
      )}

      <SeekButtons
        onSeek={(seconds) =>
          playerRef.current?.seekTo(
            playerRef.current?.getCurrentTime() + seconds,
            'seconds'
          )
        }
      />
    </div>
  )
}
