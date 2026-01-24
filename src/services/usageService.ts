import type { AppInfo, SuggestionItem, UsageEntry, NotificationSummary, RunningAppSummary, AppTimeLimit, AppSettings } from '../types/models'

export interface UsageSnapshot {
  generatedAt: string
  apps: AppInfo[]
  usageEntries: UsageEntry[]
  activeAppId?: string | null
  runningApps?: RunningAppSummary[]
}

export const fetchUsageSnapshot = async (): Promise<UsageSnapshot> => {
  if (window.screenforge?.getUsageSnapshot) {
    return window.screenforge.getUsageSnapshot()
  }

  return {
    generatedAt: new Date().toISOString(),
    apps: [],
    usageEntries: [],
    activeAppId: null,
    runningApps: [],
  }
}

export const clearUsageData = async (): Promise<UsageSnapshot> => {
  if (window.screenforge?.clearUsageData) {
    return window.screenforge.clearUsageData()
  }

  return {
    generatedAt: new Date().toISOString(),
    apps: [],
    usageEntries: [],
    activeAppId: null,
    runningApps: [],
  }
}

export const fetchSuggestions = async (): Promise<SuggestionItem[]> => {
  if (window.screenforge?.getSuggestionFeed) {
    return window.screenforge.getSuggestionFeed()
  }

  return []
}

export const fetchNotificationSummary = async (): Promise<NotificationSummary> => {
  if (window.screenforge?.getNotificationSummary) {
    return window.screenforge.getNotificationSummary()
  }

  return {
    total: 0,
    perApp: {},
  }
}

// Settings
export const fetchSettings = async (): Promise<AppSettings> => {
  if (window.screenforge?.getSettings) {
    return window.screenforge.getSettings()
  }

  return {
    minimizeToTray: true,
    startWithWindows: false,
    timeLimits: [],
    timeLimitNotificationsEnabled: true,
  }
}

export const updateSettings = async (settings: Partial<AppSettings>): Promise<AppSettings> => {
  if (window.screenforge?.setSettings) {
    return window.screenforge.setSettings(settings)
  }

  return {
    minimizeToTray: true,
    startWithWindows: false,
    timeLimits: [],
    timeLimitNotificationsEnabled: true,
  }
}

// Time Limits
export const fetchTimeLimits = async (): Promise<AppTimeLimit[]> => {
  if (window.screenforge?.getTimeLimits) {
    return window.screenforge.getTimeLimits()
  }
  return []
}

export const saveTimeLimits = async (limits: AppTimeLimit[]): Promise<AppTimeLimit[]> => {
  if (window.screenforge?.setTimeLimits) {
    return window.screenforge.setTimeLimits(limits)
  }
  return []
}

export const addTimeLimit = async (limit: AppTimeLimit): Promise<AppTimeLimit[]> => {
  if (window.screenforge?.addTimeLimit) {
    return window.screenforge.addTimeLimit(limit)
  }
  return []
}

export const removeTimeLimit = async (appId: string): Promise<AppTimeLimit[]> => {
  if (window.screenforge?.removeTimeLimit) {
    return window.screenforge.removeTimeLimit(appId)
  }
  return []
}

export const onTimeLimitExceeded = (
  callback: (data: { appId: string; appName: string; usedMinutes: number; limitMinutes: number }) => void
): (() => void) => {
  if (window.screenforge?.onTimeLimitExceeded) {
    return window.screenforge.onTimeLimitExceeded(callback)
  }
  return () => {}
}
