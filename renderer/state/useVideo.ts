import { create } from 'zustand';

interface VideoState {
  currentSeconds: number,
  path: string
}

export const useVideo = create<VideoState>((set, get) => ({
  currentSeconds: 0,
  path: ""
}))

export function setCurrentSeconds(seconds:number) {
  useVideo.setState({
    currentSeconds: seconds
  })
  
}

export function setVideoPath(path:string) {
  useVideo.setState({
    path
  })
  
}