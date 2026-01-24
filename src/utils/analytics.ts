import type { AppInfo, UsageEntry } from '../types/models'

// Get today's date string in local timezone
export const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get date string for a specific date offset (0 = today, -1 = yesterday, etc.)
export const getDateString = (daysOffset: number = 0): string => {
  const now = new Date()
  now.setDate(now.getDate() + daysOffset)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format a date string for display
export const formatDateLabel = (dateString: string): string => {
  const today = getTodayDateString()
  const yesterday = getDateString(-1)
  
  if (dateString === today) return 'Today'
  if (dateString === yesterday) return 'Yesterday'
  
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export const formatMinutes = (minutes: number) => {
  if (minutes === 0) return '0m'
  if (minutes < 1) return '<1m'
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

// Format seconds with more granularity for real-time display
export const formatSeconds = (totalSeconds: number) => {
  if (totalSeconds < 60) return `${Math.floor(totalSeconds)}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  if (minutes < 60) return `${minutes}m ${seconds}s`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export const getTotalMinutes = (entries: UsageEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.minutes, 0)

export const getTotalSeconds = (entries: UsageEntry[]) =>
  entries.reduce((sum, entry) => sum + (entry.seconds ?? entry.minutes * 60), 0)

export const getTotalNotifications = (entries: UsageEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.notifications, 0)

export const groupByDay = (entries: UsageEntry[]) => {
  const map = new Map<string, UsageEntry[]>()
  for (const entry of entries) {
    if (!map.has(entry.date)) map.set(entry.date, [])
    map.get(entry.date)?.push(entry)
  }
  return map
}

// Filter entries for a specific date
export const getEntriesForDate = (entries: UsageEntry[], dateString: string): UsageEntry[] => {
  return entries.filter(entry => entry.date === dateString)
}

// Get today's entries
export const getTodayEntries = (entries: UsageEntry[]): UsageEntry[] => {
  return getEntriesForDate(entries, getTodayDateString())
}

// Get available dates from entries (sorted, most recent first)
export const getAvailableDates = (entries: UsageEntry[]): string[] => {
  const dates = new Set<string>()
  for (const entry of entries) {
    dates.add(entry.date)
  }
  return Array.from(dates).sort((a, b) => b.localeCompare(a))
}

export const getDailyTotals = (entries: UsageEntry[]) => {
  const days = groupByDay(entries)
  return Array.from(days.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayEntries]) => ({
      date,
      minutes: getTotalMinutes(dayEntries),
      seconds: getTotalSeconds(dayEntries),
      notifications: getTotalNotifications(dayEntries),
    }))
}

export const getAverageMinutes = (entries: UsageEntry[], divisor: number) =>
  Math.round(getTotalMinutes(entries) / divisor)

export const getCategoryTotals = (entries: UsageEntry[], apps: AppInfo[]) => {
  const categoryMap = new Map<string, number>()
  const appLookup = new Map(apps.map((app) => [app.id, app]))

  for (const entry of entries) {
    const app = appLookup.get(entry.appId)
    if (!app) continue
    categoryMap.set(app.category, (categoryMap.get(app.category) ?? 0) + entry.minutes)
  }

  return Array.from(categoryMap.entries())
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
}

export const getAppTotals = (entries: UsageEntry[], apps: AppInfo[]) => {
  const appMap = new Map<string, { minutes: number; seconds: number }>()
  const appLookup = new Map(apps.map((app) => [app.id, app]))

  for (const entry of entries) {
    const existing = appMap.get(entry.appId) ?? { minutes: 0, seconds: 0 }
    appMap.set(entry.appId, {
      minutes: existing.minutes + entry.minutes,
      seconds: existing.seconds + (entry.seconds ?? entry.minutes * 60),
    })
  }

  return Array.from(appMap.entries())
    .map(([appId, { minutes, seconds }]) => ({ app: appLookup.get(appId), minutes, seconds }))
    .filter((row): row is { app: AppInfo; minutes: number; seconds: number } => Boolean(row.app))
    .sort((a, b) => b.seconds - a.seconds)
}

export const getNotificationTotals = (entries: UsageEntry[], apps: AppInfo[]) => {
  const appMap = new Map<string, number>()
  const appLookup = new Map(apps.map((app) => [app.id, app]))

  for (const entry of entries) {
    appMap.set(entry.appId, (appMap.get(entry.appId) ?? 0) + entry.notifications)
  }

  return Array.from(appMap.entries())
    .map(([appId, notifications]) => ({ app: appLookup.get(appId), notifications }))
    .filter((row): row is { app: AppInfo; notifications: number } => Boolean(row.app))
    .sort((a, b) => b.notifications - a.notifications)
}

// Productive categories for focus score calculation
const PRODUCTIVE_CATEGORIES = ['Productivity', 'Education', 'Communication', 'Utilities', 'Browsers']

// Calculate focus score based on productive vs non-productive time
// Returns a score from 0-100
export const calculateFocusScore = (entries: UsageEntry[], apps: AppInfo[]): number => {
  if (entries.length === 0) return 0
  
  const appLookup = new Map(apps.map((a) => [a.id, a]))
  let productiveMinutes = 0
  let totalMinutes = 0
  
  for (const entry of entries) {
    const app = appLookup.get(entry.appId)
    totalMinutes += entry.minutes
    if (app && PRODUCTIVE_CATEGORIES.includes(app.category)) {
      productiveMinutes += entry.minutes
    }
  }
  
  if (totalMinutes === 0) return 0
  
  const ratio = productiveMinutes / totalMinutes
  return Math.min(100, Math.round(ratio * 100))
}
