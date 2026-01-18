import type { AppInfo, SuggestionItem, UsageEntry, NotificationSummary, RunningAppSummary } from '../types/models'

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
