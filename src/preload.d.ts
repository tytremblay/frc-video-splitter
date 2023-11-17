import { IpcHandler } from './preload';

declare global {
  interface Window {
    ipc: IpcHandler;
  }
}
