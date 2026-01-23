import * as electron from 'electron'
import path from 'node:path'
import { createNotificationTracker } from './notifications'
import { createUsageTracker } from './telemetry'

const { app, BrowserWindow, Tray, Menu, nativeImage } = electron
const { ipcMain } = electron

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)

const usageTracker = createUsageTracker()
const notificationTracker = createNotificationTracker()

let mainWindow: electron.BrowserWindow | null = null
let tray: electron.Tray | null = null
let isQuitting = false

const ZOOM_STEP = 0.1
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3.0

// Settings stored in memory, synced with renderer
let settings = {
  minimizeToTray: true,
  startWithWindows: false,
}

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
    const appInfo = appLookup.get(entry.appId)
    if (appInfo) {
      categoryMinutes.set(appInfo.category, (categoryMinutes.get(appInfo.category) ?? 0) + entry.minutes)
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

const createTray = () => {
  // Create the ScreenForge tray icon programmatically
  // 16x16 icon with monitor shape in blue accent color
  const size = 16
  const canvas = Buffer.alloc(size * size * 4)
  
  // Colors matching our theme
  const bgColor = { r: 9, g: 9, b: 11, a: 255 }      // #09090b - dark bg
  const accentColor = { r: 59, g: 130, b: 246, a: 255 } // #3b82f6 - blue accent
  const white = { r: 250, g: 250, b: 250, a: 255 }   // #fafafa
  
  const setPixel = (x: number, y: number, color: { r: number; g: number; b: number; a: number }) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 4
    canvas[i] = color.r
    canvas[i + 1] = color.g
    canvas[i + 2] = color.b
    canvas[i + 3] = color.a
  }
  
  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(x, y, bgColor)
    }
  }
  
  // Draw monitor outline (simplified for 16x16)
  // Top edge
  for (let x = 2; x <= 13; x++) { setPixel(x, 2, white) }
  // Bottom edge of monitor
  for (let x = 2; x <= 13; x++) { setPixel(x, 10, white) }
  // Left edge
  for (let y = 2; y <= 10; y++) { setPixel(2, y, white) }
  // Right edge
  for (let y = 2; y <= 10; y++) { setPixel(13, y, white) }
  
  // Monitor stand
  setPixel(7, 11, white); setPixel(8, 11, white)
  setPixel(7, 12, white); setPixel(8, 12, white)
  for (let x = 5; x <= 10; x++) { setPixel(x, 13, white) }
  
  // Terminal prompt (chevron) - blue accent
  setPixel(4, 5, accentColor)
  setPixel(5, 6, accentColor)
  setPixel(4, 7, accentColor)
  
  // Terminal line - blue accent
  for (let x = 7; x <= 11; x++) { setPixel(x, 8, accentColor) }
  
  const trayIcon = nativeImage.createFromBuffer(canvas, { width: size, height: size })
  
  tray = new Tray(trayIcon)
  tray.setToolTip('ScreenForge - Screen Time Tracker')
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show ScreenForge',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])
  
  tray.setContextMenu(contextMenu)
  
  // Double-click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// Create app icon for window (32x32)
const createAppIcon = () => {
  const size = 32
  const canvas = Buffer.alloc(size * size * 4)
  
  const bgColor = { r: 9, g: 9, b: 11, a: 255 }
  const accentColor = { r: 59, g: 130, b: 246, a: 255 }
  const white = { r: 250, g: 250, b: 250, a: 255 }
  
  const setPixel = (x: number, y: number, color: { r: number; g: number; b: number; a: number }) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 4
    canvas[i] = color.r
    canvas[i + 1] = color.g
    canvas[i + 2] = color.b
    canvas[i + 3] = color.a
  }
  
  // Fill with rounded rect background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(x, y, bgColor)
    }
  }
  
  // Draw monitor outline (scaled for 32x32)
  // Top edge
  for (let x = 4; x <= 27; x++) { setPixel(x, 4, white); setPixel(x, 5, white) }
  // Bottom edge of monitor
  for (let x = 4; x <= 27; x++) { setPixel(x, 20, white); setPixel(x, 21, white) }
  // Left edge
  for (let y = 4; y <= 21; y++) { setPixel(4, y, white); setPixel(5, y, white) }
  // Right edge
  for (let y = 4; y <= 21; y++) { setPixel(26, y, white); setPixel(27, y, white) }
  
  // Monitor stand
  for (let x = 14; x <= 17; x++) {
    for (let y = 22; y <= 25; y++) { setPixel(x, y, white) }
  }
  // Stand base
  for (let x = 10; x <= 21; x++) { setPixel(x, 26, white); setPixel(x, 27, white) }
  
  // Terminal chevron - blue accent
  for (let i = 0; i < 2; i++) {
    setPixel(8 + i, 10, accentColor); setPixel(9 + i, 10, accentColor)
    setPixel(10 + i, 11, accentColor); setPixel(11 + i, 11, accentColor)
    setPixel(12 + i, 12, accentColor); setPixel(13 + i, 12, accentColor)
    setPixel(10 + i, 13, accentColor); setPixel(11 + i, 13, accentColor)
    setPixel(8 + i, 14, accentColor); setPixel(9 + i, 14, accentColor)
  }
  
  // Terminal line - blue accent
  for (let x = 15; x <= 24; x++) { 
    setPixel(x, 16, accentColor)
    setPixel(x, 17, accentColor)
  }
  
  return nativeImage.createFromBuffer(canvas, { width: size, height: size })
}

const createWindow = async () => {
  const appIcon = createAppIcon()
  
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#09090b',
    show: false,
    frame: true,
    autoHideMenuBar: true,
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  const adjustZoom = async (delta: number) => {
    const wc = mainWindow?.webContents
    if (!wc) return

    const current = await wc.getZoomFactor()
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number((current + delta).toFixed(2))))
    await wc.setZoomFactor(next)
  }

  // Ctrl +/- zoom controls (Windows/Linux). Also supports Cmd on macOS.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    if (!(input.control || input.meta)) return

    const isMinus = input.key === '-' || input.code === 'Minus' || input.code === 'NumpadSubtract'
    // Many layouts report Ctrl+'+' as Ctrl+'=' (same physical key), and browsers commonly
    // treat Ctrl+=' as zoom-in, so we accept both.
    const isPlus =
      input.key === '+' ||
      input.key === '=' ||
      input.key === 'Add' ||
      input.code === 'Equal' ||
      input.code === 'NumpadAdd' ||
      input.code === 'NumpadEqual'

    if (isMinus) {
      event.preventDefault()
      void adjustZoom(-ZOOM_STEP)
      return
    }

    if (isPlus) {
      event.preventDefault()
      void adjustZoom(ZOOM_STEP)
    }
  })

  // Handle close button - minimize to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
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

// Configure auto-launch on Windows startup
const setAutoLaunch = (enable: boolean) => {
  if (process.platform !== 'win32') return
  
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe'),
  })
}

app.whenReady().then(() => {
  // IPC Handlers
  ipcMain.handle('usage:snapshot', () => usageTracker.getSnapshot())
  ipcMain.handle('usage:clear', () => {
    usageTracker.clearData()
    return usageTracker.getSnapshot()
  })
  ipcMain.handle('suggestions:list', () => generateSuggestions())
  ipcMain.handle('notifications:summary', () => notificationTracker.getSummary())
  
  // Settings handlers
  ipcMain.handle('settings:get', () => settings)
  ipcMain.handle('settings:set', (_event, newSettings: Partial<typeof settings>) => {
    if (typeof newSettings.minimizeToTray === 'boolean') {
      settings.minimizeToTray = newSettings.minimizeToTray
    }
    if (typeof newSettings.startWithWindows === 'boolean') {
      settings.startWithWindows = newSettings.startWithWindows
      setAutoLaunch(newSettings.startWithWindows)
    }
    return settings
  })

  // Create tray icon first
  createTray()
  
  // Then create main window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })
})

// Handle before-quit to allow actual quitting
app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  // On Windows/Linux, don't quit when all windows are closed if minimize to tray is enabled
  // The app keeps running in background via the tray
  if (process.platform === 'darwin') {
    // On macOS, keep app running (standard behavior)
  } else if (!settings.minimizeToTray) {
    usageTracker.dispose()
    app.quit()
  }
  // If minimizeToTray is true, app stays running in background
})

// Clean up on actual quit
app.on('will-quit', () => {
  usageTracker.dispose()
  if (tray) {
    tray.destroy()
    tray = null
  }
})
