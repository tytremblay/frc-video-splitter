import { create } from 'zustand';

interface VideoState {
  currentSeconds: number
  path: string
  durationSeconds: number
  videoTimelineOffsetSecs: number | null
}

export const useVideo = create<VideoState>(() => ({
  currentSeconds: 0,
  path: '',
  durationSeconds: 0,
  videoTimelineOffsetSecs: null,
}))

export function setCurrentSeconds(seconds: number) {
  useVideo.setState({ currentSeconds: seconds })
}

export function setVideoPath(path: string) {
  useVideo.setState({ path, durationSeconds: 0, videoTimelineOffsetSecs: null })
}

export function setVideoDuration(duration: number) {
  useVideo.setState({ durationSeconds: duration })
}

export function setVideoTimelineOffset(secs: number) {
  useVideo.setState({ videoTimelineOffsetSecs: secs })
}
