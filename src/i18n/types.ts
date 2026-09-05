export const supportedLocales = ['en-US', 'zh-CN'] as const

export type LocaleCode = (typeof supportedLocales)[number]

export type TranslationTree = {
  [key: string]: string | TranslationTree
}
