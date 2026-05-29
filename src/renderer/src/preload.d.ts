import type { IpcApi } from '../../shared/ipc'

declare global {
  interface Window {
    ipc: IpcApi
  }
}

