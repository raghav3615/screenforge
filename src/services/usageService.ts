import { apps, usageEntries, suggestions } from '../data/mock'

export interface UsageSnapshot {
  generatedAt: string
  apps: typeof apps
  usageEntries: typeof usageEntries
}

export const fetchUsageSnapshot = async (): Promise<UsageSnapshot> => {
  if (window.screenforge?.getUsageSnapshot) {
    return window.screenforge.getUsageSnapshot()
  }

  return {
    generatedAt: new Date().toISOString(),
    apps,
    usageEntries,
  }
}

export const fetchSuggestions = async () => {
  if (window.screenforge?.getSuggestionFeed) {
    return window.screenforge.getSuggestionFeed()
  }

  return suggestions
}

export const fetchNotificationSummary = async () => {
  if (window.screenforge?.getNotificationSummary) {
    return window.screenforge.getNotificationSummary()
  }

  const counts = usageEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.appId] = (acc[entry.appId] ?? 0) + entry.notifications
    return acc
  }, {})

  return {
    total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    perApp: counts,
  }
}
