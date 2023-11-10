import { config } from 'dotenv'
import { app, dialog, ipcMain } from 'electron'
import serve from 'electron-serve'
import path from 'path'
import { createWindow } from './helpers'
import { SplitFixedDetails } from './helpers/ffmpegCommands'

config()

const isProd = process.env.NODE_ENV === 'production'

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv'] }],
  })
  if (!canceled) {
    return filePaths[0]
  }
}

async function handleDirectoryOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  if (!canceled) {
    return filePaths[0]
  }
}

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('dialog:openDirectory', handleDirectoryOpen)
  ipcMain.handle('split:start', async (event, details: SplitFixedDetails[]) => {
    const { splitFixedLength } = await import('./helpers/ffmpegCommands')
    const work = details.map(
      async (detail) => await splitFixedLength(event, detail)
    )
    await Promise.all(work)
    event.sender.send('split-end', { matchKey: details[0].matchKey })
  })

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
