import { create } from 'zustand';

interface VideoState {
  lengthSeconds: number;
  currentSeconds: number;
  seekSeconds: number;
  path: string;
}

export const useVideo = create<VideoState>((set, get) => ({
  lengthSeconds: 0,
  currentSeconds: 0,
  seekSeconds: 0,
  path: '',
}));

export function setLength(seconds: number) {
  useVideo.setState({
    lengthSeconds: seconds,
  });
}

export function setCurrentSeconds(seconds: number) {
  useVideo.setState({
    currentSeconds: seconds,
  });
}

export function setVideoPath(path: string) {
  useVideo.setState({
    path,
  });
}

export function seekSeconds(seconds: number) {
  useVideo.setState({
    seekSeconds: seconds,
  });
}
