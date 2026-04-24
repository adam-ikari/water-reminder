import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Plus, Clock, Calendar, Settings, Bell, BellOff, X, History, Info, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { WaterLevel } from '../WaterLevel'
import type { DrinkRecord, ViewType } from './types'

interface FoldableLayoutProps {
  today: number
  goal: number
  progress: number
  history: DrinkRecord[]
  streak: number
  isAnimating: boolean
  reminderEnabled: boolean
  reminderInterval: number
  isLandscape: boolean
  onAddDrink: () => void
  onRemoveDrink: (id: string) => void
  onToggleReminder: () => void
  onViewChange: (view: ViewType) => void
  onOpenSettings: () => void
  language: string
}

export function FoldableLayout({
  today,
  goal,
  progress,
  history,
  streak,
  isAnimating,
  reminderEnabled,
  reminderInterval,
  isLandscape,
  onAddDrink,
  onRemoveDrink,
  onToggleReminder,
  onViewChange,
  onOpenSettings,
  language,
}: FoldableLayoutProps) {
  const { t } = useTranslation()

  const todayRecords = history
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reverse()

  // Landscape: side-by-side layout
  if (isLandscape) {
    return (
      <div className="min-h-screen flex">
        {/* Left pane - Main content */}
        <div className="flex-1 p-6 flex flex-col">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-4"
          >
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {t('title')}
            </h1>
          </motion.div>

          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card glass-pane-left p-6 w-full max-w-sm"
            >
              {/* Water level */}
              <div className="relative mb-4">
                <WaterLevel progress={progress} height={140} className="w-full rounded-xl" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={today}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-gray-800 dark:text-white"
                  >
                    {today}
                  </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    / {goal} {t('glasses')}
                  </div>
                </div>
              </div>

              {/* Progress & Add button row */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium text-cyan-600 dark:text-cyan-400">
                    {progress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {progress >= 100 ? t('goalReached') : t('keepGoing')}
                  </div>
                </div>

                <div className="relative">
                  <AnimatePresence>
                    {isAnimating && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-cyan-400/30"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddDrink}
                    className="w-14 h-14 glass-primary flex items-center justify-center"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right pane - Stats & History */}
        <div className="w-80 p-6 flex flex-col gap-4">
          {/* Today's records */}
          {todayRecords.length > 0 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass-card glass-pane-right p-4"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{t('todayDrinks')}</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {todayRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20"
                  >
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-cyan-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(record.timestamp).toLocaleTimeString(
                          language === 'zh' ? 'zh-CN' : 'en-US',
                          { hour: '2-digit', minute: '2-digit', hour12: language === 'en' }
                        )}
                      </span>
                    </div>
                    <button onClick={() => onRemoveDrink(record.id)} className="text-red-400 p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card glass-pane-right p-4"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{t('summary')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20">
                <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{history.length}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('totalDrinks')}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{streak}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('dayStreak')}</div>
              </div>
            </div>
          </motion.div>

          {/* Reminder */}
          <button
            onClick={onToggleReminder}
            className="glass-card glass-pane-right p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span className="text-sm">
                {reminderEnabled ? t('remindersEvery', { minutes: reminderInterval }) : t('enableReminders')}
              </span>
            </div>
          </button>

          {/* Navigation */}
          <div className="flex gap-2 mt-auto">
            <button onClick={() => onViewChange('history')} className="flex-1 glass-button p-2 flex items-center justify-center gap-1">
              <History className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">{t('history')}</span>
            </button>
            <button onClick={onOpenSettings} className="flex-1 glass-button p-2 flex items-center justify-center gap-1">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">{t('settings')}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Portrait: stacked layout (similar to mobile but wider)
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-5">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full">
              <WaterLevel progress={progress} height={150} className="w-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={today}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-bold text-gray-800 dark:text-white"
                >
                  {today}
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  / {goal} {t('glasses')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-medium text-cyan-600 dark:text-cyan-400">
                  {progress.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {progress >= 100 ? t('goalReached') : t('keepGoing')}
                </div>
              </div>

              <div className="relative">
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-cyan-400/30"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddDrink}
                  className="w-16 h-16 glass-primary flex items-center justify-center"
                >
                  <Plus className="w-7 h-7 text-white" />
                </motion.button>
              </div>
            </div>

            <button
              onClick={onToggleReminder}
              className="text-cyan-600 dark:text-cyan-400 text-sm flex items-center gap-2"
            >
              {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>
                {reminderEnabled ? t('remindersEvery', { minutes: reminderInterval }) : t('enableReminders')}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Two column stats */}
        <div className="grid grid-cols-2 gap-4">
          {todayRecords.length > 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{t('todayDrinks')}</span>
              </div>
              <div className="space-y-1">
                {todayRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(record.timestamp).toLocaleTimeString(
                        language === 'zh' ? 'zh-CN' : 'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: language === 'en' }
                      )}
                    </span>
                    <button onClick={() => onRemoveDrink(record.id)} className="text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{t('summary')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20">
                <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{history.length}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('totalDrinks')}</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{streak}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('dayStreak')}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 flex gap-3"
        >
          <button onClick={() => onViewChange('history')} className="p-2 rounded-lg">
            <History className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => onViewChange('about')} className="p-2 rounded-lg">
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => onViewChange('privacy')} className="p-2 rounded-lg">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={onOpenSettings} className="p-2 rounded-lg">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}