import type { PlatformAPI, NotificationOptions, DeviceInfo } from './types'

const deviceInfo: DeviceInfo = {
  type: 'browser',
  platform: 'web',
}

export const webPlatform: PlatformAPI = {
  storage: {
    get: async (key: string) => localStorage.getItem(key),
    set: async (key: string, value: string) => localStorage.setItem(key, value),
  },

  notification: {
    requestPermission: async () => {
      if (!('Notification' in window)) return false
      const result = await Notification.requestPermission()
      return result === 'granted'
    },

    schedule: async (options: NotificationOptions) => {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      if (options.scheduledAt) {
        const delay = options.scheduledAt.getTime() - Date.now()
        if (delay > 0) {
          setTimeout(() => {
            new Notification(options.title, { body: options.body })
          }, delay)
        }
      } else {
        new Notification(options.title, { body: options.body })
      }
    },

    cancel: async () => {
      // Web notifications can't be cancelled once shown
    },
  },

  device: deviceInfo,
}