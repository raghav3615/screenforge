import type { AppInfo, SuggestionItem, UsageEntry, NotificationSummary } from '../types/models'

export interface UsageSnapshot {
  generatedAt: string
  apps: AppInfo[]
  usageEntries: UsageEntry[]
}

export const fetchUsageSnapshot = async (): Promise<UsageSnapshot> => {
  if (window.screenforge?.getUsageSnapshot) {
    return window.screenforge.getUsageSnapshot()
  }

  return {
    generatedAt: new Date().toISOString(),
    apps: [],
    usageEntries: [],
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
