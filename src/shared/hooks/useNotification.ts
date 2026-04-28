import { useCallback, useEffect } from 'react'
import { getPlatform } from '../../platforms'

export function useNotification() {
  const requestPermission = useCallback(async () => {
    const platform = await getPlatform()
    return platform.notification.requestPermission()
  }, [])

  const scheduleReminder = useCallback(async (title: string, body: string, delayMinutes: number) => {
    const platform = await getPlatform()
    const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000)
    await platform.notification.schedule({ title, body, scheduledAt })
  }, [])

  useEffect(() => {
    // Request permission on mount
    requestPermission()
  }, [requestPermission])

  return { requestPermission, scheduleReminder }
}
