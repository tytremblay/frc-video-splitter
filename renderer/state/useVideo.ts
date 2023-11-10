import { create } from 'zustand'

interface VideoState {
  currentSeconds: number
  seekSeconds: number
  path: string
}

export const useVideo = create<VideoState>((set, get) => ({
  currentSeconds: 0,
  seekSeconds: 0,
  path: '',
}))

export function setCurrentSeconds(seconds: number) {
  useVideo.setState({
    currentSeconds: seconds,
  })
}

export function setVideoPath(path: string) {
  useVideo.setState({
    path,
  })
}

export function seekSeconds(seconds: number) {
  useVideo.setState({
    seekSeconds: seconds,
  })
}
