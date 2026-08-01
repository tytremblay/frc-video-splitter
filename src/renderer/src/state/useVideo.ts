import { create } from 'zustand';
import { useMatches } from './useMatches';

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
  useMatches.setState(state => ({
    matches: state.matches.map(m => ({ ...m, fromSeconds: undefined, toSeconds: undefined }))
  }))
}

export function setVideoDuration(duration: number) {
  useVideo.setState({ durationSeconds: duration })
}

export function setVideoTimelineOffset(secs: number) {
  useVideo.setState({ videoTimelineOffsetSecs: secs })
  useMatches.setState(state => ({
    matches: state.matches.map(m => {
      if (m.actualTime == null || m.postResultTime == null) return m
      return { ...m, fromSeconds: m.actualTime - secs, toSeconds: m.postResultTime - secs }
    })
  }))
}
