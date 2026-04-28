export interface DrinkRecord {
  id: string
  timestamp: Date
  amount: number
}

export interface WaterState {
  count: number
  goal: number
  history: DrinkRecord[]
  dark: boolean
  language: 'zh' | 'en'
}

export type DeviceType = 'phone' | 'tablet' | 'watch' | 'desktop' | 'browser'
