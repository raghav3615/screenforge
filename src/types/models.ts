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
  notifications: number
}

export interface SuggestionItem {
  id: string
  title: string
  detail: string
}

export interface NotificationSummary {
  total: number
  perApp: Record<string, number>
}
