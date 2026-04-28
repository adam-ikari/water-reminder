export interface NotificationOptions {
  title: string
  body: string
  id?: string
  scheduledAt?: Date
}

export interface DeviceInfo {
  type: 'phone' | 'tablet' | 'watch' | 'desktop' | 'browser'
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web'
}

export interface PlatformAPI {
  storage: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
  }
  notification: {
    requestPermission: () => Promise<boolean>
    schedule: (options: NotificationOptions) => Promise<void>
    cancel: (id: string) => Promise<void>
  }
  device: DeviceInfo
}