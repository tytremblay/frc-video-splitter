import { join } from 'path'
import { app, dialog, ipcMain } from 'electron'
import { createWindow } from './helpers'
import type { SplitFixedDetails } from '../../shared/types'

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv'] }]
  })
  if (!canceled) return filePaths[0]
}

async function handleDirectoryOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (!canceled) return filePaths[0]
}

;(async () => {
  await app.whenReady()

  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('dialog:openDirectory', handleDirectoryOpen)
  ipcMain.handle('split:start', async (event, details: SplitFixedDetails[]) => {
    const { splitFixedLength } = await import('./helpers/ffmpegCommands')
    const work = details.map(async (detail) => await splitFixedLength(event, detail))
    await Promise.all(work)
    event.sender.send('split-end', { matchKey: details[0].matchKey })
  })

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false,
    },
  })

  if (process.env.NODE_ENV === 'development' && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
