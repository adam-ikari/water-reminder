import type { PlatformAPI } from './types'
import { webPlatform } from './web'
import { tauriPlatform, initDeviceInfo } from './tauri'

// Declare Tauri global for TypeScript
declare global {
  interface Window {
    __TAURI__?: unknown
  }
}

let platform: PlatformAPI

export async function getPlatform(): Promise<PlatformAPI> {
  if (platform) return platform

  if (window.__TAURI__) {
    await initDeviceInfo()
    platform = tauriPlatform
  } else {
    platform = webPlatform
  }

  return platform
}

export type { PlatformAPI, NotificationOptions, DeviceInfo } from './types'