import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Clock, Calendar, Settings, Plus, Bell, BellOff, X, Globe, History, ArrowLeft, Info, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './i18n'

interface DrinkRecord {
  id: string
  timestamp: Date
  amount: number
}

interface WaterStats {
  today: number
  goal: number
  history: DrinkRecord[]
  streak: number
}

type ViewType = 'home' | 'history' | 'settings' | 'about' | 'privacy'

const WaterDropAnimation = ({ isAnimating }: { isAnimating: boolean }) => (
  <div className="relative">
    <AnimatePresence>
      {isAnimating && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400/30"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80"
              initial={{ y: 0, scale: 1, opacity: 0.7 }}
              animate={{ y: -40 - i * 15, scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  </div>
)

const ProgressRing = ({ progress, size = 200, strokeWidth = 12 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-cyan-100 dark:text-dark-cyan-900/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-cyan-500"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState<WaterStats>({
    today: 0,
    goal: 8,
    history: [],
    streak: 0
  })
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [isAnimating, setIsAnimating] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderInterval, setReminderInterval] = useState(30)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newGoal, setNewGoal] = useState(8)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const checkViewport = () => {
      setIsCompact(window.matchMedia('(max-width: 320px)').matches)
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('waterReminder')
    if (saved) {
      const data = JSON.parse(saved)
      data.history = data.history.map((r: DrinkRecord) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }))
      setStats(data)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('waterReminder', JSON.stringify(stats))
  }, [stats])

  useEffect(() => {
    const today = new Date().toDateString()
    const lastRecord = stats.history[stats.history.length - 1]
    if (lastRecord && new Date(lastRecord.timestamp).toDateString() !== today) {
      setStats(prev => ({ ...prev, today: 0 }))
    }
  }, [stats.history])

  useEffect(() => {
    if (!reminderEnabled) return
    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification(t('notificationTitle'), {
          body: t('notificationBody', { today: stats.today, goal: stats.goal }),
          icon: '💧'
        })
      }
    }, reminderInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [reminderEnabled, reminderInterval, stats.today, stats.goal, t])

  const addDrink = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1500)
    const newRecord: DrinkRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      amount: 1
    }
    setStats(prev => ({
      ...prev,
      today: prev.today + 1,
      history: [...prev.history, newRecord]
    }))
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [])

  const removeDrink = useCallback((id: string) => {
    setStats(prev => ({
      ...prev,
      today: Math.max(0, prev.today - 1),
      history: prev.history.filter(r => r.id !== id)
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
      history: prev.history.filter(r => new Date(r.timestamp).toDateString() !== today)
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
  const todayRecords = stats.history.filter(
    r => new Date(r.timestamp).toDateString() === new Date().toDateString()
  ).reverse()

  const groupedHistory = stats.history.reduce((acc, record) => {
    const date = new Date(record.timestamp).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(record)
    return acc
  }, {} as Record<string, DrinkRecord[]>)

  if (isCompact) {
    return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-sky-950 dark:to-blue-950 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addDrink}
            className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600"
          >
            <WaterDropAnimation isAnimating={isAnimating} />
            <Plus className="w-16 h-16 text-white" />
          </motion.button>
          <div className="mt-4 text-4xl font-bold text-gray-800 dark:text-white">
            {stats.today} / {stats.goal}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {progress.toFixed(0)}%
          </div>
          <button
            onClick={() => setCurrentView('settings')}
            className="mt-4 text-gray-600 dark:text-gray-400 p-2"
          >
            <Settings className="w-6 h-6 mx-auto" />
          </button>
        </motion.div>

        {currentView === 'settings' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setCurrentView('home')}>
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t('settings')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('dailyGoal')}</label>
                  <input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('language')}</label>
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setCurrentView('home')} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300">{t('cancel')}</button>
                <button onClick={saveSettings} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg">{t('save')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-safe pt-safe pl-safe pr-safe">
      <div className="max-w-lg mx-auto space-y-6 px-4 sm:px-8 py-8">
        {currentView === 'home' && (
          <>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {t('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-card shadow-2xl overflow-hidden rounded-2xl p-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <ProgressRing progress={progress} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        key={stats.today}
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        className="text-5xl font-bold text-gray-800 dark:text-gray-100"
                      >
                        {stats.today}
                      </motion.div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        / {stats.goal} {t('glasses')}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400">
                      {progress.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {progress >= 100 ? t('goalReached') : t('keepGoing')}
                    </div>
                  </div>

                  <div className="relative">
                    <WaterDropAnimation isAnimating={isAnimating} />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addDrink}
                      className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 hover:from-cyan-500 hover:via-blue-600 hover:to-cyan-700"
                    >
                      <Plus className="w-10 h-10 text-white" />
                    </motion.button>
                  </div>

                  <button
                    onClick={toggleReminder}
                    className="text-cyan-600 dark:text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex items-center gap-2"
                  >
                    {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    <span>{reminderEnabled ? t('remindersEvery', { minutes: reminderInterval }) : t('enableReminders')}</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {todayRecords.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="glass-card shadow-2xl rounded-2xl">
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">{t('todayDrinks')}</span>
                      </div>
                      <button
                        onClick={() => setCurrentView('history')}
                        className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline"
                      >
                        {t('viewAll')}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 pt-2">
                    <div className="space-y-2">
                      {todayRecords.slice(0, 3).map((record, index) => (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Droplets className="w-5 h-5 text-cyan-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {new Date(record.timestamp).toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: i18n.language === 'en'
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => removeDrink(record.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="glass-card shadow-2xl rounded-2xl">
                <div className="p-4 pb-2">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">{t('summary')}</span>
                  </div>
                </div>
                <div className="p-4 pt-2 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      {stats.history.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {t('totalDrinks')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.streak}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {t('dayStreak')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {currentView === 'history' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {t('history')}
              </h2>
            </div>

            <div className="glass-card shadow-2xl rounded-2xl">
              <div className="p-4">
                {Object.entries(groupedHistory)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .map(([date, records]) => (
                    <div key={date} className="mb-6 last:mb-0">
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        {new Date(date).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="space-y-2">
                        {records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((record) => (
                          <motion.div
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Droplets className="w-5 h-5 text-cyan-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {new Date(record.timestamp).toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: i18n.language === 'en'
                                })}
                              </span>
                            </div>
                            {new Date(record.timestamp).toDateString() === new Date().toDateString() && (
                              <button
                                onClick={() => removeDrink(record.id)}
                                className="text-red-500 hover:text-red-600 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'about' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {t('about')}
              </h2>
            </div>

            <div className="glass-card shadow-2xl rounded-2xl p-6">
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold mb-2">{t('appName')}</h3>
                  <p className="text-sm">{t('appDescription')}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('version')}</h3>
                  <p className="text-sm">1.0.0</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('developer')}</h3>
                  <p className="text-sm">Claude</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {t('privacy')}
              </h2>
            </div>

            <div className="glass-card shadow-2xl rounded-2xl p-6">
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-sm leading-relaxed">{t('privacyDescription')}</p>
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold">{t('dataCollected')}</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t('dataCollected1')}</li>
                    <li>{t('dataCollected2')}</li>
                    <li>{t('dataCollected3')}</li>
                  </ul>
                </div>
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold">{t('dataUsage')}</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t('dataUsage1')}</li>
                    <li>{t('dataUsage2')}</li>
                  </ul>
                </div>
                <p className="text-sm leading-relaxed">{t('dataStorage')}</p>
                <p className="text-sm leading-relaxed">{t('dataDeletion')}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => setCurrentView('history')}
            className={`text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${currentView === 'history' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${currentView === 'about' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('privacy')}
            className={`text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${currentView === 'privacy' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          >
            <Shield className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${currentView === 'settings' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">{t('settings')}</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  {t('dailyGoal')}
                </label>
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="20"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('reminders')}
                    </span>
                  </div>
                  <button
                    onClick={toggleReminder}
                    className={`w-12 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {reminderEnabled && (
                  <div className="pl-6 space-y-3">
                    <label className="text-xs text-gray-600 dark:text-gray-400 block">
                      {t('interval', { minutes: reminderInterval })}
                    </label>
                    <input
                      type="range"
                      value={reminderInterval}
                      onChange={(e) => setReminderInterval(Number(e.target.value))}
                      min={15}
                      max={120}
                      step={15}
                      className="w-full accent-cyan-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  {t('language')}
                </label>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={resetToday}
                className="w-full px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700"
              >
                {t('resetToday')}
              </button>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  {t('save')}
                </button>
              </div>
                       </div>
          </div>
        </div>
      )}
    </div>
  )
}
