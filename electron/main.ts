import * as electron from 'electron'
import path from 'node:path'
import * as fs from 'node:fs'
import { createNotificationTracker } from './notifications'
import { createUsageTracker } from './telemetry'

const { app, BrowserWindow, Tray, Menu, nativeImage, Notification } = electron
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

type ThemeName = 'light' | 'dark' | 'tokyo' | 'skin'

const themeTitlebar: Record<ThemeName, { background: string; text: string }> = {
  dark: { background: '#09090b', text: '#fafafa' },
  light: { background: '#fafafa', text: '#09090b' },
  tokyo: { background: '#0f0b1a', text: '#f0e6ff' },
  skin: { background: '#f3eee9', text: '#2d1e17' },
}

const applyThemeToWindow = (theme: ThemeName) => {
  if (!mainWindow) return
  const colors = themeTitlebar[theme] ?? themeTitlebar.dark
  try {
    mainWindow.setTitleBarOverlay({ color: colors.background, symbolColor: colors.text })
  } catch {
    // Ignore if unsupported (older Electron / platform)
  }
  try {
    mainWindow.setBackgroundColor(colors.background)
  } catch {
    // Ignore if unsupported
  }
}

// App time limit interface
interface AppTimeLimit {
  appId: string
  limitMinutes: number
  enabled: boolean
}

// Settings stored in memory, synced with renderer and persisted
interface AppSettings {
  minimizeToTray: boolean
  startWithWindows: boolean
  timeLimits: AppTimeLimit[]
  timeLimitNotificationsEnabled: boolean
}

// Track which alerts have been shown today to avoid spam
interface TimeLimitAlert {
  appId: string
  date: string
  notifiedAt: string
}

let settings: AppSettings = {
  minimizeToTray: true,
  startWithWindows: false,
  timeLimits: [],
  timeLimitNotificationsEnabled: true,
}

let shownAlerts: TimeLimitAlert[] = []

// Get today's date in Windows local timezone
const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getSettingsPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'settings.json')
}

const getAlertsPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'alerts.json')
}

const loadSettings = () => {
  const settingsPath = getSettingsPath()
  try {
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, 'utf8')
      const loaded = JSON.parse(raw) as Partial<AppSettings>
      settings = {
        minimizeToTray: loaded.minimizeToTray ?? true,
        startWithWindows: loaded.startWithWindows ?? false,
        timeLimits: loaded.timeLimits ?? [],
        timeLimitNotificationsEnabled: loaded.timeLimitNotificationsEnabled ?? true,
      }
    }
  } catch {
    // Use defaults
  }
}

const saveSettings = () => {
  const settingsPath = getSettingsPath()
  try {
    const dir = path.dirname(settingsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  } catch {
    // Ignore save errors
  }
}

const loadAlerts = () => {
  const alertsPath = getAlertsPath()
  try {
    if (fs.existsSync(alertsPath)) {
      const raw = fs.readFileSync(alertsPath, 'utf8')
      shownAlerts = JSON.parse(raw) as TimeLimitAlert[]
      // Clean up old alerts (not from today)
      const today = getTodayDateString()
      shownAlerts = shownAlerts.filter(a => a.date === today)
    }
  } catch {
    shownAlerts = []
  }
}

const saveAlerts = () => {
  const alertsPath = getAlertsPath()
  try {
    const dir = path.dirname(alertsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(alertsPath, JSON.stringify(shownAlerts, null, 2))
  } catch {
    // Ignore save errors
  }
}

// Check time limits and show notifications
const checkTimeLimits = () => {
  if (!settings.timeLimitNotificationsEnabled) return
  if (settings.timeLimits.length === 0) return

  const snapshot = usageTracker.getSnapshot()
  const today = getTodayDateString()
  const appLookup = new Map(snapshot.apps.map(a => [a.id, a]))

  // Calculate today's usage per app
  const todayUsage = new Map<string, number>()
  for (const entry of snapshot.usageEntries) {
    if (entry.date === today) {
      const currentMinutes = todayUsage.get(entry.appId) ?? 0
      todayUsage.set(entry.appId, currentMinutes + entry.minutes)
    }
  }

  // Check each time limit
  for (const limit of settings.timeLimits) {
    if (!limit.enabled) continue

    const usedMinutes = todayUsage.get(limit.appId) ?? 0
    if (usedMinutes >= limit.limitMinutes) {
      // Check if we already showed an alert for this app today
      const alreadyNotified = shownAlerts.some(
        a => a.appId === limit.appId && a.date === today
      )

      if (!alreadyNotified) {
        const appInfo = appLookup.get(limit.appId)
        const appName = appInfo?.name ?? limit.appId

        // Show notification
        const notification = new Notification({
          title: 'Time Limit Reached',
          body: `You've used ${appName} for ${usedMinutes} minutes today. Your limit is ${limit.limitMinutes} minutes.`,
          icon: undefined,
          silent: false,
        })

        notification.show()

        // Record the alert
        shownAlerts.push({
          appId: limit.appId,
          date: today,
          notifiedAt: new Date().toISOString(),
        })
        saveAlerts()

        // Send to renderer to update UI
        if (mainWindow) {
          mainWindow.webContents.send('time-limit-exceeded', {
            appId: limit.appId,
            appName,
            usedMinutes,
            limitMinutes: limit.limitMinutes,
          })
        }
      }
    }
  }
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
    backgroundColor: themeTitlebar.dark.background,
    show: false,
    frame: true,
    titleBarStyle: 'default',
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
  // Load persisted settings and alerts
  loadSettings()
  loadAlerts()

  // IPC Handlers
  ipcMain.handle('usage:snapshot', () => usageTracker.getSnapshot())
  ipcMain.handle('usage:clear', () => {
    usageTracker.clearData()
    return usageTracker.getSnapshot()
  })
  ipcMain.handle('theme:set', (_event, theme: ThemeName) => {
    applyThemeToWindow(theme)
    return true
  })
  ipcMain.handle('suggestions:list', () => generateSuggestions())
  ipcMain.handle('notifications:summary', () => notificationTracker.getSummary())
  
  // Settings handlers
  ipcMain.handle('settings:get', () => settings)
  ipcMain.handle('settings:set', (_event, newSettings: Partial<AppSettings>) => {
    if (typeof newSettings.minimizeToTray === 'boolean') {
      settings.minimizeToTray = newSettings.minimizeToTray
    }
    if (typeof newSettings.startWithWindows === 'boolean') {
      settings.startWithWindows = newSettings.startWithWindows
      setAutoLaunch(newSettings.startWithWindows)
    }
    if (Array.isArray(newSettings.timeLimits)) {
      settings.timeLimits = newSettings.timeLimits
    }
    if (typeof newSettings.timeLimitNotificationsEnabled === 'boolean') {
      settings.timeLimitNotificationsEnabled = newSettings.timeLimitNotificationsEnabled
    }
    saveSettings()
    return settings
  })

  // Time limit handlers
  ipcMain.handle('timelimits:get', () => settings.timeLimits)
  ipcMain.handle('timelimits:set', (_event, limits: AppTimeLimit[]) => {
    settings.timeLimits = limits
    saveSettings()
    return settings.timeLimits
  })
  ipcMain.handle('timelimits:add', (_event, limit: AppTimeLimit) => {
    // Remove existing limit for this app if any
    settings.timeLimits = settings.timeLimits.filter(l => l.appId !== limit.appId)
    settings.timeLimits.push(limit)
    saveSettings()
    return settings.timeLimits
  })
  ipcMain.handle('timelimits:remove', (_event, appId: string) => {
    settings.timeLimits = settings.timeLimits.filter(l => l.appId !== appId)
    saveSettings()
    return settings.timeLimits
  })
  ipcMain.handle('timelimits:alerts', () => shownAlerts)

  // Create tray icon first
  createTray()
  
  // Then create main window
  createWindow()

  // Check time limits every 30 seconds
  const timeLimitInterval = setInterval(checkTimeLimits, 30000)
  // Initial check after 5 seconds
  setTimeout(checkTimeLimits, 5000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })

  // Clean up interval on quit
  app.on('will-quit', () => {
    clearInterval(timeLimitInterval)
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
    notificationTracker.dispose()
    app.quit()
  }
  // If minimizeToTray is true, app stays running in background
})

// Clean up on actual quit
app.on('will-quit', () => {
  usageTracker.dispose()
  notificationTracker.dispose()
  if (tray) {
    tray.destroy()
    tray = null
  }
})
