import * as electron from 'electron'

const { contextBridge, ipcRenderer } = electron

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
  getNotificationSummary: async () => {
    try {
      return await ipcRenderer.invoke('notifications:summary')
    } catch {
      return {
        total: 0,
        perApp: {},
      }
    }
  },
}

contextBridge.exposeInMainWorld('screenforge', api)

export type ScreenforgeApi = typeof api
