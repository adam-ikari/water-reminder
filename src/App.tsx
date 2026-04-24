import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Bell, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './i18n'
import { useDeviceType } from './hooks/useDeviceType'
import {
  WatchLayout,
  MobileLayout,
  FoldableLayout,
  TabletLayout,
  DesktopLayout,
  type DrinkRecord,
  type ViewType,
} from './components/layouts'

interface WaterStats {
  today: number
  goal: number
  history: DrinkRecord[]
  streak: number
}

export default function App() {
  const { t, i18n } = useTranslation()
  const deviceInfo = useDeviceType()

  const [stats, setStats] = useState<WaterStats>({
    today: 0,
    goal: 8,
    history: [],
    streak: 0,
  })
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [isAnimating, setIsAnimating] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderInterval, setReminderInterval] = useState(30)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newGoal, setNewGoal] = useState(8)

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('waterReminder')
    if (saved) {
      const data = JSON.parse(saved)
      data.history = data.history.map((r: DrinkRecord) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }))
      setStats(data)
      setNewGoal(data.goal)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('waterReminder', JSON.stringify(stats))
  }, [stats])

  // Reset today count on new day
  useEffect(() => {
    const today = new Date().toDateString()
    const lastRecord = stats.history[stats.history.length - 1]
    if (lastRecord && new Date(lastRecord.timestamp).toDateString() !== today) {
      setStats(prev => ({ ...prev, today: 0 }))
    }
  }, [stats.history])

  // Notification reminder
  useEffect(() => {
    if (!reminderEnabled) return
    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification(t('notificationTitle'), {
          body: t('notificationBody', { today: stats.today, goal: stats.goal }),
        })
      }
    }, reminderInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [reminderEnabled, reminderInterval, stats.today, stats.goal, t])

  const addDrink = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
    const newRecord: DrinkRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      amount: 1,
    }
    setStats(prev => ({
      ...prev,
      today: prev.today + 1,
      history: [...prev.history, newRecord],
    }))
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [])

  const removeDrink = useCallback((id: string) => {
    setStats(prev => ({
      ...prev,
      today: Math.max(0, prev.today - 1),
      history: prev.history.filter(r => r.id !== id),
    }))
  }, [])

  const saveSettings = () => {
    setStats(prev => ({ ...prev, goal: newGoal }))
    setIsSettingsOpen(false)
  }

  const resetToday = () => {
    const today = new Date().toDateString()
    setStats(prev => ({
      ...prev,
      today: 0,
      history: prev.history.filter(r => new Date(r.timestamp).toDateString() !== today),
    }))
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const toggleReminder = () => {
    if (!reminderEnabled) {
      requestNotificationPermission()
    }
    setReminderEnabled(!reminderEnabled)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  const progress = Math.min((stats.today / stats.goal) * 100, 100)

  // Common props for all layouts
  const layoutProps = {
    today: stats.today,
    goal: stats.goal,
    progress,
    history: stats.history,
    streak: stats.streak,
    isAnimating,
    reminderEnabled,
    reminderInterval,
    currentView,
    onAddDrink: addDrink,
    onRemoveDrink: removeDrink,
    onToggleReminder: toggleReminder,
    onViewChange: setCurrentView,
    onOpenSettings: () => setIsSettingsOpen(true),
    language: i18n.language,
  }

  // Settings dialog
  const SettingsDialog = () => (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={() => setIsSettingsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-lg font-semibold text-gray-800 dark:text-white">{t('settings')}</span>
            </div>

            <div className="space-y-6">
              {/* Daily goal */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  {t('dailyGoal')}
                </label>
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                  className="w-full px-4 py-3 glass-input text-gray-800 dark:text-white"
                  min="1"
                  max="20"
                />
              </div>

              {/* Reminders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reminders')}</span>
                  </div>
                  <button
                    onClick={toggleReminder}
                    className={`w-12 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {reminderEnabled && (
                  <div className="pl-6">
                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">
                      {t('interval', { minutes: reminderInterval })}
                    </label>
                    <input
                      type="range"
                      value={reminderInterval}
                      onChange={(e) => setReminderInterval(Number(e.target.value))}
                      min={15}
                      max={120}
                      step={15}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  {t('language')}
                </label>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="flex-1 px-4 py-3 glass-input text-gray-800 dark:text-white"
                  >
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={resetToday}
                className="w-full px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t('resetToday')}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 px-4 py-3 glass-button text-gray-700 dark:text-gray-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 px-4 py-3 glass-primary text-white"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Render appropriate layout based on device type
  const renderLayout = () => {
    switch (deviceInfo.type) {
      case 'watch':
        return <WatchLayout {...layoutProps} />
      case 'mobile':
        return <MobileLayout {...layoutProps} />
      case 'foldable':
        return <FoldableLayout {...layoutProps} isLandscape={deviceInfo.isLandscape} />
      case 'tablet':
        return <TabletLayout {...layoutProps} />
      case 'desktop':
      default:
        return <DesktopLayout {...layoutProps} />
    }
  }

  return (
    <>
      {renderLayout()}
      <SettingsDialog />
    </>
  )
}