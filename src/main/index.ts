import { join } from 'path'
import { app } from 'electron'
import { createWindow } from './helpers'
import { registerIpcHandlers } from './ipc'

;(async () => {
  await app.whenReady()

  registerIpcHandlers()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false
    }
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

