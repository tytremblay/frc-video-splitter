import type { IpcHandler } from '../../preload/index'

declare global {
  interface Window {
    ipc: IpcHandler
  }
}
