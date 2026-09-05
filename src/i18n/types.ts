export const supportedLocales = ['zh-CN', 'en-US'] as const

export type LocaleCode = (typeof supportedLocales)[number]

export type TranslationTree = {
  [key: string]: string | TranslationTree
}
