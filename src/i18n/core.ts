import type { ThemeName } from '../types/models'
import { enUS } from './locales/en-US'
import { zhCN } from './locales/zh-CN'
import { supportedLocales, type LocaleCode, type TranslationTree } from './types'

const dictionaries: Record<LocaleCode, TranslationTree> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const defaultLocale: LocaleCode = 'zh-CN'

export const normalizeLocale = (value?: string | null): LocaleCode => {
  if (!value) return defaultLocale
  if (supportedLocales.includes(value as LocaleCode)) return value as LocaleCode
  if (value.toLowerCase().startsWith('zh')) return 'zh-CN'
  if (value.toLowerCase().startsWith('en')) return 'en-US'
  return defaultLocale
}

const getNestedValue = (tree: TranslationTree, path: string): string | undefined => {
  const value = path.split('.').reduce<string | TranslationTree | undefined>((current, segment) => {
    if (!current || typeof current === 'string') {
      return undefined
    }
    return current[segment]
  }, tree)

  return typeof value === 'string' ? value : undefined
}

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_match, key) => String(params[key] ?? ''))
}

export const translate = (locale: LocaleCode, key: string, params?: Record<string, string | number>) => {
  const resolvedLocale = normalizeLocale(locale)
  const template =
    getNestedValue(dictionaries[resolvedLocale], key) ??
    getNestedValue(dictionaries[defaultLocale], key) ??
    key

  return interpolate(template, params)
}

export const getLocaleOptions = (): Array<{ code: LocaleCode; label: string }> =>
  supportedLocales.map((code) => ({
    code,
    label: translate(code, `locales.${code}`),
  }))

export const translateThemeName = (locale: LocaleCode, theme: ThemeName) =>
  translate(locale, `themes.${theme}.name`)

export const translateThemeDescription = (locale: LocaleCode, theme: ThemeName) =>
  translate(locale, `themes.${theme}.description`)

export const translateCategoryLabel = (locale: LocaleCode, category: string) => {
  const resolvedLocale = normalizeLocale(locale)
  const localeTree = dictionaries[resolvedLocale].categories as TranslationTree
  const defaultTree = dictionaries[defaultLocale].categories as TranslationTree
  const translated =
    (localeTree[category] as string | undefined) ??
    (defaultTree[category] as string | undefined)

  return translated ?? category
}

export const formatDate = (
  locale: LocaleCode,
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(normalizeLocale(locale), options).format(date)
}

const getDateString = (daysOffset = 0) => {
  const now = new Date()
  now.setDate(now.getDate() + daysOffset)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatRelativeDateLabel = (locale: LocaleCode, dateString: string) => {
  const today = getDateString(0)
  const yesterday = getDateString(-1)

  if (dateString === today) return translate(locale, 'common.today')
  if (dateString === yesterday) return translate(locale, 'common.yesterday')

  return formatDate(locale, `${dateString}T00:00:00`, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const formatMonthLabel = (locale: LocaleCode, date: Date) =>
  formatDate(locale, date, { year: 'numeric', month: 'long' })

export const formatDurationMinutes = (locale: LocaleCode, minutes: number) => {
  const resolvedLocale = normalizeLocale(locale)

  if (resolvedLocale === 'zh-CN') {
    if (minutes === 0) return '0分'
    if (minutes < 1) return '<1分'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours === 0) return `${mins}分`
    return `${hours}小时 ${mins}分`
  }

  if (minutes === 0) return '0m'
  if (minutes < 1) return '<1m'
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

export const formatDurationSeconds = (locale: LocaleCode, totalSeconds: number) => {
  const resolvedLocale = normalizeLocale(locale)

  if (resolvedLocale === 'zh-CN') {
    if (totalSeconds < 60) return `${Math.floor(totalSeconds)}秒`
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    if (minutes < 60) return `${minutes}分 ${seconds}秒`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时 ${mins}分`
  }

  if (totalSeconds < 60) return `${Math.floor(totalSeconds)}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  if (minutes < 60) return `${minutes}m ${seconds}s`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export { supportedLocales }
export type { LocaleCode, TranslationTree }
