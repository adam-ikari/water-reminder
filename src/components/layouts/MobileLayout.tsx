import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Plus, Clock, Calendar, Settings, Bell, BellOff, X, History, Info, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { WaterLevel } from '../WaterLevel'
import type { DrinkRecord } from './types'

interface MobileLayoutProps {
  today: number
  goal: number
  progress: number
  history: DrinkRecord[]
  streak: number
  isAnimating: boolean
  reminderEnabled: boolean
  reminderInterval: number
  currentView: 'home' | 'history' | 'settings' | 'about' | 'privacy'
  onAddDrink: () => void
  onRemoveDrink: (id: string) => void
  onToggleReminder: () => void
  onViewChange: (view: 'home' | 'history' | 'settings' | 'about' | 'privacy') => void
  onOpenSettings: () => void
  language: string
}

export function MobileLayout({
  today,
  goal,
  progress,
  history,
  streak,
  isAnimating,
  reminderEnabled,
  reminderInterval,
  currentView,
  onAddDrink,
  onRemoveDrink,
  onToggleReminder,
  onViewChange,
  onOpenSettings,
  language,
}: MobileLayoutProps) {
  const { t } = useTranslation()

  const todayRecords = history
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reverse()

  return (
    <div className="min-h-screen pb-safe pt-safe pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {currentView === 'home' && (
          <>
            {/* Header */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </motion.div>

            {/* Main progress card with water level */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex flex-col items-center space-y-4">
                {/* Water level display */}
                <div className="relative w-full">
                  <WaterLevel progress={progress} height={160} className="w-full" />

                  {/* Stats overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      key={today}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold text-gray-800 dark:text-white drop-shadow-md"
                    >
                      {today}
                    </motion.div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      / {goal} {t('glasses')}
                    </div>
                  </div>
                </div>

                {/* Progress percentage */}
                <div className="text-center">
                  <div className="text-xl font-medium text-cyan-600 dark:text-cyan-400">
                    {progress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {progress >= 100 ? t('goalReached') : t('keepGoing')}
                  </div>
                </div>

                {/* Add button */}
                <div className="relative">
                  <AnimatePresence>
                    {isAnimating && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-cyan-400/30"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddDrink}
                    className="relative w-16 h-16 glass-primary flex items-center justify-center"
                  >
                    <Plus className="w-7 h-7 text-white" />
                  </motion.button>
                </div>

                {/* Reminder toggle */}
                <button
                  onClick={onToggleReminder}
                  className="text-cyan-600 dark:text-cyan-400 text-sm flex items-center gap-2 py-2"
                >
                  {reminderEnabled ? (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>{t('remindersEvery', { minutes: reminderInterval })}</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-4 h-4" />
                      <span>{t('enableReminders')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Today's drinks */}
            {todayRecords.length > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
              >
                <div className="p-4 border-b border-gray-100/50 dark:border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('todayDrinks')}</span>
                    </div>
                    <button
                      onClick={() => onViewChange('history')}
                      className="text-cyan-600 dark:text-cyan-400 text-xs"
                    >
                      {t('viewAll')}
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {todayRecords.slice(0, 3).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20"
                    >
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(record.timestamp).toLocaleTimeString(
                            language === 'zh' ? 'zh-CN' : 'en-US',
                            { hour: '2-digit', minute: '2-digit', hour12: language === 'en' }
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveDrink(record.id)}
                        className="text-red-400 hover:text-red-500 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stats summary */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{t('summary')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {history.length}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    {t('totalDrinks')}
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {streak}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    {t('dayStreak')}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Bottom navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 flex gap-3"
        >
          <button
            onClick={() => onViewChange('history')}
            className={`p-2 rounded-lg transition-colors ${currentView === 'history' ? 'bg-cyan-100/50 dark:bg-cyan-900/30' : ''}`}
          >
            <History className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onViewChange('about')}
            className={`p-2 rounded-lg transition-colors ${currentView === 'about' ? 'bg-cyan-100/50 dark:bg-cyan-900/30' : ''}`}
          >
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onViewChange('privacy')}
            className={`p-2 rounded-lg transition-colors ${currentView === 'privacy' ? 'bg-cyan-100/50 dark:bg-cyan-900/30' : ''}`}
          >
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-cyan-100/50 dark:bg-cyan-900/30' : ''}`}
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}