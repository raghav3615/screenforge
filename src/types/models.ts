export type ThemeName = 'light' | 'dark' | 'tokyo' | 'skin'

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
