import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { IpcChannel } from '../shared/ipc'
import type { IpcApi } from '../shared/ipc'
import type { SplitFixedDetails } from '../shared/types'

function subscribeToEvent<T>(channel: IpcChannel, callback: (payload: T) => void) {
  const subscription = (_event: IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, subscription)
  return () => {
    ipcRenderer.removeListener(channel, subscription)
  }
}

const api: IpcApi = {
  openFile() {
    return ipcRenderer.invoke(IpcChannel.OpenFile)
  },
  openDirectory() {
    return ipcRenderer.invoke(IpcChannel.OpenDirectory)
  },
  splitMatches(details: SplitFixedDetails[]) {
    return ipcRenderer.invoke(IpcChannel.SplitStart, details)
  },
  onSplitStart(callback) {
    return subscribeToEvent(IpcChannel.SplitStart, callback)
  },
  onSplitProgress(callback) {
    return subscribeToEvent(IpcChannel.SplitProgress, callback)
  },
  onSplitEnd(callback) {
    return subscribeToEvent(IpcChannel.SplitEnd, callback)
  }
}

contextBridge.exposeInMainWorld('ipc', api)

export type { IpcApi }

