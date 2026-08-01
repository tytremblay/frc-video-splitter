import { existsSync } from 'fs'
import os from 'os'
import { dialog, ipcMain } from 'electron'
import { IpcChannel } from '../shared/ipc'
import type { SplitFixedDetails, ConcurrencyLevel } from '../shared/types'

function resolveConcurrency(level: ConcurrencyLevel): number {
  const cpuCount = os.cpus().length
  switch (level) {
    case 'efficient':   return Math.max(1, Math.floor(cpuCount * 0.25))
    case 'normal':      return Math.max(2, Math.floor(cpuCount * 0.5))
    case 'performance': return cpuCount
    case 'extreme':     return Infinity
  }
}

async function runConcurrent<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  if (limit === Infinity || limit >= tasks.length) return Promise.all(tasks.map(t => t()))
  const results: T[] = new Array(tasks.length)
  let next = 0
  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

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
  ipcMain.handle(IpcChannel.SplitStart, async (event, details: SplitFixedDetails[], level: ConcurrencyLevel = 'normal') => {
    const { splitFixedLength } = await import('./helpers/ffmpegCommands')
    await runConcurrent(
      details.map(detail => () => splitFixedLength(event, detail)),
      resolveConcurrency(level)
    )
    event.sender.send(IpcChannel.SplitEnd, { matchKey: details[0].matchKey })
  })
}
