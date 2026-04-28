import { useCallback } from 'react'
import { useStorage } from './useStorage'
import type { DrinkRecord, WaterState } from '../types'
import { DEFAULT_GOAL, STORAGE_KEY } from '../constants'

const initialState: WaterState = {
  count: 0,
  goal: DEFAULT_GOAL,
  history: [],
  dark: false,
  language: 'zh',
}

export function useWaterData() {
  const [state, setState, loaded] = useStorage<WaterState>(STORAGE_KEY, initialState)

  const add = useCallback(() => {
    if (state.count >= state.goal) return
    const newRecord: DrinkRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      amount: 1,
    }
    setState({
      ...state,
      count: state.count + 1,
      history: [...state.history, newRecord],
    })
  }, [state, setState])

  const remove = useCallback((id: string) => {
    const record = state.history.find(r => r.id === id)
    if (!record) return
    setState({
      ...state,
      count: Math.max(0, state.count - record.amount),
      history: state.history.filter(r => r.id !== id),
    })
  }, [state, setState])

  const setGoal = useCallback((goal: number) => {
    setState({ ...state, goal })
  }, [state, setState])

  const setDark = useCallback((dark: boolean) => {
    setState({ ...state, dark })
  }, [state, setState])

  const setLanguage = useCallback((language: 'zh' | 'en') => {
    setState({ ...state, language })
  }, [state, setState])

  const todayHistory = state.history
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reverse()

  const level = (state.count / state.goal) * 100

  return {
    count: state.count,
    goal: state.goal,
    history: todayHistory,
    dark: state.dark,
    language: state.language,
    level,
    loaded,
    add,
    remove,
    setGoal,
    setDark,
    setLanguage,
  }
}
