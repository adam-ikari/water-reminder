export interface DrinkRecord {
  id: string
  timestamp: Date
  amount: number
}

export interface WaterStats {
  today: number
  goal: number
  history: DrinkRecord[]
  streak: number
}

export type ViewType = 'home' | 'history' | 'settings' | 'about' | 'privacy'