import * as electron from 'electron'
import path from 'node:path'
import { createNotificationTracker } from './notifications'
import { createUsageTracker } from './telemetry'

const { app, BrowserWindow } = electron
const { ipcMain } = electron

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)

const usageTracker = createUsageTracker()
const notificationTracker = createNotificationTracker()

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0b0d12',
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    await mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('usage:snapshot', () => usageTracker.getSnapshot())
  ipcMain.handle('suggestions:list', () => [])
  ipcMain.handle('notifications:summary', () => notificationTracker.getSummary())

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    usageTracker.dispose()
    app.quit()
  }
})
