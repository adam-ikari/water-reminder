import { useState, useEffect, useCallback } from 'react'
import { getPlatform } from '../../platforms'

export function useStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getPlatform().then(platform => {
      platform.storage.get(key).then(stored => {
        if (stored) {
          try {
            setValue(JSON.parse(stored))
          } catch {
            setValue(stored as unknown as T)
          }
        }
        setLoaded(true)
      })
    })
  }, [key])

  const setAndSave = useCallback(async (newValue: T) => {
    setValue(newValue)
    const platform = await getPlatform()
    await platform.storage.set(key, JSON.stringify(newValue))
  }, [key])

  return [value, setAndSave, loaded] as const
}
