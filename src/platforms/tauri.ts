import type { PlatformAPI, NotificationOptions, DeviceInfo } from './types'

let deviceInfo: DeviceInfo = {
  type: 'phone',
  platform: 'android',
}

export const tauriPlatform: PlatformAPI = {
  storage: {
    get: async (key: string) => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const result = await invoke<string>('get_data', { key })
        return result ?? null
      } catch {
        return null
      }
    },

    set: async (key: string, value: string) => {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('set_data', { key, value })
    },
  },

  notification: {
    requestPermission: async () => {
      const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification')
      if (await isPermissionGranted()) return true
      const permission = await requestPermission()
      return permission === 'granted'
    },

    schedule: async (options: NotificationOptions) => {
      const { sendNotification } = await import('@tauri-apps/plugin-notification')
      await sendNotification({
        title: options.title,
        body: options.body,
      })
    },

    cancel: async (id: string) => {
      const { cancel } = await import('@tauri-apps/plugin-notification')
      const numericId = parseInt(id, 10)
      if (!isNaN(numericId)) {
        await cancel([numericId])
      }
    },
  },

  device: deviceInfo,
}

export async function initDeviceInfo() {
  try {
    const { platform } = await import('@tauri-apps/plugin-os')
    const os = await platform()

    const { innerWidth, innerHeight } = window
    const minDim = Math.min(innerWidth, innerHeight)

    let type: DeviceInfo['type'] = 'phone'
    if (minDim < 200) type = 'watch'
    else if (minDim < 600) type = 'phone'
    else if (innerWidth > innerHeight * 1.5) type = 'tablet'
    else type = 'desktop'

    deviceInfo = { type, platform: os as DeviceInfo['platform'] }
  } catch {
    // Fallback to defaults
  }
}