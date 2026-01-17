import * as electron from 'electron'
import path from 'node:path'
import { createNotificationTracker } from './notifications'
import { createUsageTracker } from './telemetry'

const { app, BrowserWindow } = electron
const { ipcMain } = electron

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)

const usageTracker = createUsageTracker()
const notificationTracker = createNotificationTracker()

// Generate dynamic suggestions based on usage patterns
const generateSuggestions = () => {
  const snapshot = usageTracker.getSnapshot()
  const suggestions: Array<{ id: string; title: string; detail: string }> = []

  if (snapshot.usageEntries.length === 0) {
    suggestions.push({
      id: 'welcome',
      title: 'Welcome to ScreenForge!',
      detail: 'Keep the app running to track your screen time automatically.',
    })
    return suggestions
  }

  // Calculate category totals
  const categoryMinutes = new Map<string, number>()
  const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]))
  
  for (const entry of snapshot.usageEntries) {
    const app = appLookup.get(entry.appId)
    if (app) {
      categoryMinutes.set(app.category, (categoryMinutes.get(app.category) ?? 0) + entry.minutes)
    }
  }

  const totalMinutes = Array.from(categoryMinutes.values()).reduce((s, v) => s + v, 0)
  
  // Check for high entertainment usage
  const entertainmentMinutes = categoryMinutes.get('Entertainment') ?? 0
  if (entertainmentMinutes > 0 && entertainmentMinutes / totalMinutes > 0.3) {
    suggestions.push({
      id: 'entertainment',
      title: 'High entertainment usage',
      detail: 'Consider setting time limits for entertainment apps to boost productivity.',
    })
  }

  // Check for high social media usage
  const socialMinutes = categoryMinutes.get('Social') ?? 0
  if (socialMinutes > 0 && socialMinutes / totalMinutes > 0.2) {
    suggestions.push({
      id: 'social',
      title: 'Social apps taking over',
      detail: 'Try scheduling specific times for checking social media.',
    })
  }

  // Praise productivity
  const productiveMinutes = (categoryMinutes.get('Productivity') ?? 0) + (categoryMinutes.get('Education') ?? 0)
  if (productiveMinutes > 0 && productiveMinutes / totalMinutes > 0.5) {
    suggestions.push({
      id: 'productive',
      title: 'Great focus!',
      detail: 'You\'re spending most of your time on productive tasks. Keep it up!',
    })
  }

  // General tips
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'balance',
      title: 'Balanced usage',
      detail: 'Your screen time is well distributed across different activities.',
    })
  }

  suggestions.push({
    id: 'breaks',
    title: 'Remember to take breaks',
    detail: 'Use the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
  })

  return suggestions
}

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
    // In packaged app, app.getAppPath() points to app.asar, dist is inside it
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
    await mainWindow.loadFile(indexPath)
  }
}

app.whenReady().then(() => {
  ipcMain.handle('usage:snapshot', () => usageTracker.getSnapshot())
  ipcMain.handle('suggestions:list', () => generateSuggestions())
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
