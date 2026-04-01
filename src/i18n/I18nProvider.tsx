import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ThemeName } from '../types/models'
import {
  defaultLocale,
  formatDate,
  formatDurationMinutes,
  formatDurationSeconds,
  formatMonthLabel,
  formatRelativeDateLabel,
  getLocaleOptions,
  normalizeLocale,
  translate,
  translateCategoryLabel,
  translateThemeDescription,
  translateThemeName,
  type LocaleCode,
} from './core'

const LOCALE_STORAGE_KEY = 'screenforge-locale'

interface I18nContextValue {
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => string
  formatDateLabel: (dateString: string) => string
  formatMonthLabel: (date: Date) => string
  formatMinutes: (minutes: number) => string
  formatSeconds: (seconds: number) => string
  translateCategory: (category: string) => string
  translateThemeName: (theme: ThemeName) => string
  translateThemeDescription: (theme: ThemeName) => string
  localeOptions: Array<{ code: LocaleCode; label: string }>
}

const I18nContext = createContext<I18nContextValue | null>(null)

const getInitialLocale = (): LocaleCode => {
  if (typeof window === 'undefined') return defaultLocale

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored) return normalizeLocale(stored)

  return normalizeLocale(window.navigator.language)
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale)
  const setLocale = useCallback((nextLocale: LocaleCode) => {
    setLocaleState(normalizeLocale(nextLocale))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params),
    formatDate: (value, options) => formatDate(locale, value, options),
    formatDateLabel: (dateString) => formatRelativeDateLabel(locale, dateString),
    formatMonthLabel: (date) => formatMonthLabel(locale, date),
    formatMinutes: (minutes) => formatDurationMinutes(locale, minutes),
    formatSeconds: (seconds) => formatDurationSeconds(locale, seconds),
    translateCategory: (category) => translateCategoryLabel(locale, category),
    translateThemeName: (theme) => translateThemeName(locale, theme),
    translateThemeDescription: (theme) => translateThemeDescription(locale, theme),
    localeOptions: getLocaleOptions(),
  }), [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export type { LocaleCode }
