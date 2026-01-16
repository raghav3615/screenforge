import * as electron from 'electron'
import { apps, usageEntries, suggestions } from '../src/data/mock'

const { contextBridge, ipcRenderer } = electron

const api = {
  getUsageSnapshot: async () => {
    try {
      const snapshot = await ipcRenderer.invoke('usage:snapshot')
      return { generatedAt: new Date().toISOString(), ...snapshot }
    } catch {
      return {
        generatedAt: new Date().toISOString(),
        apps,
        usageEntries,
      }
    }
  },
  getSuggestionFeed: async () => {
    try {
      return await ipcRenderer.invoke('suggestions:list')
    } catch {
      return suggestions
    }
  },
  getNotificationSummary: async () => {
    try {
      return await ipcRenderer.invoke('notifications:summary')
    } catch {
      const counts = usageEntries.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.appId] = (acc[entry.appId] ?? 0) + entry.notifications
        return acc
      }, {})

      return {
        total: Object.values(counts).reduce((sum, value) => sum + value, 0),
        perApp: counts,
      }
    }
  },
}

contextBridge.exposeInMainWorld('screenforge', api)

export type ScreenforgeApi = typeof api
