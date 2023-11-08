import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { SplitFixedDetails } from './helpers/ffmpegCommands';

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  openFile() {
    return ipcRenderer.invoke('dialog:openFile')
  },
  openDirectory() {
    return ipcRenderer.invoke('dialog:openDirectory')
  },
  splitMatches(details: SplitFixedDetails[]) {
    return ipcRenderer.invoke('split:start', details)
  }
  
  
}

contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler