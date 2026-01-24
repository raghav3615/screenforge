import * as electron from 'electron'

const { contextBridge, ipcRenderer } = electron

// Time limit interface
interface AppTimeLimit {
  appId: string
  limitMinutes: number
  enabled: boolean
}

// Settings interface
interface AppSettings {
  minimizeToTray: boolean
  startWithWindows: boolean
  timeLimits: AppTimeLimit[]
  timeLimitNotificationsEnabled: boolean
}

const api = {
  getUsageSnapshot: async () => {
    try {
      const snapshot = await ipcRenderer.invoke('usage:snapshot')
      return { generatedAt: new Date().toISOString(), ...snapshot }
    } catch {
      return {
        generatedAt: new Date().toISOString(),
        apps: [],
        usageEntries: [],
        activeAppId: null,
        runningApps: [],
      }
    }
  },
  getSuggestionFeed: async () => {
    try {
      return await ipcRenderer.invoke('suggestions:list')
    } catch {
      return []
    }
  },
  clearUsageData: async () => {
    try {
      return await ipcRenderer.invoke('usage:clear')
    } catch {
      return {
        generatedAt: new Date().toISOString(),
        apps: [],
        usageEntries: [],
        activeAppId: null,
        runningApps: [],
      }
    }
  },
  getNotificationSummary: async () => {
    try {
      return await ipcRenderer.invoke('notifications:summary')
    } catch {
      return {
        total: 0,
        perApp: {},
        status: 'error',
      }
    }
  },
  // Settings
  getSettings: async (): Promise<AppSettings> => {
    try {
      return await ipcRenderer.invoke('settings:get')
    } catch {
      return {
        minimizeToTray: true,
        startWithWindows: false,
        timeLimits: [],
        timeLimitNotificationsEnabled: true,
      }
    }
  },
  setSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      return await ipcRenderer.invoke('settings:set', settings)
    } catch {
      return {
        minimizeToTray: true,
        startWithWindows: false,
        timeLimits: [],
        timeLimitNotificationsEnabled: true,
      }
    }
  },
  // Time limits
  getTimeLimits: async (): Promise<AppTimeLimit[]> => {
    try {
      return await ipcRenderer.invoke('timelimits:get')
    } catch {
      return []
    }
  },
  setTimeLimits: async (limits: AppTimeLimit[]): Promise<AppTimeLimit[]> => {
    try {
      return await ipcRenderer.invoke('timelimits:set', limits)
    } catch {
      return []
    }
  },
  addTimeLimit: async (limit: AppTimeLimit): Promise<AppTimeLimit[]> => {
    try {
      return await ipcRenderer.invoke('timelimits:add', limit)
    } catch {
      return []
    }
  },
  removeTimeLimit: async (appId: string): Promise<AppTimeLimit[]> => {
    try {
      return await ipcRenderer.invoke('timelimits:remove', appId)
    } catch {
      return []
    }
  },
  getTimeLimitAlerts: async () => {
    try {
      return await ipcRenderer.invoke('timelimits:alerts')
    } catch {
      return []
    }
  },
  // Event listeners
  onTimeLimitExceeded: (callback: (data: { appId: string; appName: string; usedMinutes: number; limitMinutes: number }) => void) => {
    const handler = (_event: electron.IpcRendererEvent, data: { appId: string; appName: string; usedMinutes: number; limitMinutes: number }) => {
      callback(data)
    }
    ipcRenderer.on('time-limit-exceeded', handler)
    return () => {
      ipcRenderer.removeListener('time-limit-exceeded', handler)
    }
  },
}

contextBridge.exposeInMainWorld('screenforge', api)

export type ScreenforgeApi = typeof api
