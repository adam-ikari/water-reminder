import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Plus, Clock, Calendar, Settings, Bell, BellOff, X, History, Info, Shield, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { WaterLevel } from '../WaterLevel'
import type { DrinkRecord, ViewType } from './types'

interface DesktopLayoutProps {
  today: number
  goal: number
  progress: number
  history: DrinkRecord[]
  streak: number
  isAnimating: boolean
  reminderEnabled: boolean
  reminderInterval: number
  currentView: ViewType
  onAddDrink: () => void
  onRemoveDrink: (id: string) => void
  onToggleReminder: () => void
  onViewChange: (view: ViewType) => void
  onOpenSettings: () => void
  language: string
}

export function DesktopLayout({
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
}: DesktopLayoutProps) {
  const { t } = useTranslation()

  const todayRecords = history
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reverse()

  return (
    <div className="min-h-screen flex">
      {/* Left sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 p-6 flex flex-col glass-card rounded-none rounded-r-3xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => onViewChange('home')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${currentView === 'home' ? 'bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300'}`}
          >
            <Droplets className="w-5 h-5" />
            <span className="font-medium">{t('home')}</span>
          </button>
          <button
            onClick={() => onViewChange('history')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${currentView === 'history' ? 'bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300'}`}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">{t('history')}</span>
          </button>
          <button
            onClick={() => onViewChange('about')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${currentView === 'about' ? 'bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300'}`}
          >
            <Info className="w-5 h-5" />
            <span className="font-medium">{t('about')}</span>
          </button>
          <button
            onClick={() => onViewChange('privacy')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${currentView === 'privacy' ? 'bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300'}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">{t('privacy')}</span>
          </button>
        </nav>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">{t('settings')}</span>
        </button>

        {/* Language */}
        <div className="mt-4 flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Globe className="w-4 h-4" />
          <span className="text-xs">{language === 'zh' ? '中文' : 'English'}</span>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          {currentView === 'home' && (
            <div className="grid grid-cols-3 gap-8">
              {/* Main progress - larger */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="col-span-2 glass-card p-10"
              >
                <div className="flex items-center gap-10">
                  {/* Water level */}
                  <div className="relative flex-1">
                    <WaterLevel progress={progress} height={280} className="w-full rounded-2xl" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        key={today}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-7xl font-bold text-gray-800 dark:text-white"
                      >
                        {today}
                      </motion.div>
                      <div className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                        / {goal} {t('glasses')}
                      </div>
                      <div className="text-lg text-cyan-600 dark:text-cyan-400 mt-4 font-medium">
                        {progress.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {progress >= 100 ? t('goalReached') : t('keepGoing')}
                      </div>
                    </div>
                  </div>

                  {/* Add button */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <AnimatePresence>
                        {isAnimating && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-cyan-400/30"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          />
                        )}
                      </AnimatePresence>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddDrink}
                        className="w-24 h-24 glass-primary flex items-center justify-center"
                      >
                        <Plus className="w-10 h-10 text-white" />
                      </motion.button>
                    </div>

                    {/* Reminder */}
                    <button
                      onClick={onToggleReminder}
                      className="glass-button px-6 py-3 flex items-center gap-2"
                    >
                      {reminderEnabled ? (
                        <Bell className="w-5 h-5 text-cyan-500" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {reminderEnabled
                          ? t('remindersEvery', { minutes: reminderInterval })
                          : t('enableReminders')}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Today's drinks */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{t('todayDrinks')}</span>
                    </div>
                    <button
                      onClick={() => onViewChange('history')}
                      className="text-cyan-600 dark:text-cyan-400 text-sm"
                    >
                      {t('viewAll')}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {todayRecords.length > 0 ? (
                      todayRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20"
                        >
                          <div className="flex items-center gap-3">
                            <Droplets className="w-4 h-4 text-cyan-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
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
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-6">{t('noRecords')}</div>
                    )}
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{t('summary')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20">
                      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                        {history.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('totalDrinks')}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {streak}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('dayStreak')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}