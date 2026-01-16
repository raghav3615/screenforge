import type { ScreenforgeApi } from '../../electron/preload'

declare global {
  interface Window {
    screenforge?: ScreenforgeApi
  }
}

export {}
