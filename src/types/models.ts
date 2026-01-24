export type ThemeName = 'light' | 'dark' | 'tokyo' | 'skin'

export type PageName = 'dashboard' | 'insights' | 'apps' | 'notifications' | 'settings'

export interface AppInfo {
  id: string
  name: string
  category: string
  color: string
}

export interface UsageEntry {
  date: string
  appId: string
  minutes: number
  seconds?: number  // Total seconds for more accurate display
  notifications: number
}

export interface RunningAppSummary {
  process: string
  appId: string
  count: number
  hasWindow: boolean
}

export interface SuggestionItem {
  id: string
  title: string
  detail: string
}

export interface NotificationSummary {
  total: number
  perApp: Record<string, number>
  lastUpdated?: string
  status?: 'ok' | 'no-logs' | 'error'
  errorMessage?: string
}

// Time limit for individual apps (in minutes)
export interface AppTimeLimit {
  appId: string
  limitMinutes: number
  enabled: boolean
}

// Settings stored in main process
export interface AppSettings {
  minimizeToTray: boolean
  startWithWindows: boolean
  timeLimits: AppTimeLimit[]
  timeLimitNotificationsEnabled: boolean
}

// Time limit alert that has been shown (to avoid duplicates)
export interface TimeLimitAlert {
  appId: string
  date: string  // YYYY-MM-DD
  notifiedAt: string  // ISO timestamp
}
