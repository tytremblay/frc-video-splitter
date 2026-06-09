import { existsSync } from 'fs'
import { dialog, ipcMain } from 'electron'
import { IpcChannel } from '../shared/ipc'
import type { SplitFixedDetails } from '../shared/types'

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv'] }]
  })
  if (!canceled) return filePaths[0]
  return undefined
}

async function handleDirectoryOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!canceled) return filePaths[0]
  return undefined
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IpcChannel.OpenFile, handleFileOpen)
  ipcMain.handle(IpcChannel.OpenDirectory, handleDirectoryOpen)
  ipcMain.handle(IpcChannel.CheckFilesExist, (_event, paths: string[]) =>
    paths.filter(p => existsSync(p))
  )
  ipcMain.handle(IpcChannel.SplitStart, async (event, details: SplitFixedDetails[]) => {
    const { splitFixedLength } = await import('./helpers/ffmpegCommands')
    const work = details.map(async (detail) => await splitFixedLength(event, detail))
    await Promise.all(work)
    event.sender.send(IpcChannel.SplitEnd, { matchKey: details[0].matchKey })
  })
}
