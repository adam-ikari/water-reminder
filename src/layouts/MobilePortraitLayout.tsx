import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaterCanvas, AddButton, RecordList, WeekChart, MonthCalendar, ViewSwitch, MenuButton } from '../components'
import { SettingsPage, LanguagePage, GoalPage, AboutPage } from '../pages'
import { useWaterData } from '../hooks'
import { useTranslation } from 'react-i18next'

type ViewType = 'day' | 'week' | 'month'
type PageType = 'main' | 'settings' | 'language' | 'goal' | 'about'

/**
 * Mobile portrait layout (width < 600)
 * Full-screen water animation with bottom controls
 */
export function MobilePortraitLayout() {
  const { t } = useTranslation()
  const { count, goal, history, allHistory, dark, language, level, loaded, add, remove, setGoal, setDark, setLanguage } = useWaterData()
  const [view, setView] = useState<ViewType>('day')
  const [page, setPage] = useState<PageType>('main')

  const weekData = getWeekData(allHistory)
  const monthData = getMonthData(allHistory)

  if (!loaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-900' : 'bg-gradient-to-b from-sky-400 to-blue-500'}`}>
        <div className={`text-xl ${dark ? 'text-white' : 'text-white'}`}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${dark ? 'bg-gray-900' : 'bg-gradient-to-b from-sky-400 to-blue-500'}`}>
      <WaterCanvas level={level} dark={dark} mode="fullscreen" />

      <AnimatePresence mode="wait">
        {page === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-screen flex flex-col p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-white'}`}>
                  {count}/{goal}
                </h1>
                <p className={`text-sm ${dark ? 'text-white/60' : 'text-white/80'}`}>
                  {t('cupsToday')}
                </p>
              </div>
              <MenuButton onClick={() => setPage('settings')} dark={dark} />
            </div>

            {/* View Switch */}
            <div className="mb-4">
              <ViewSwitch view={view} onChange={setView} dark={dark} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {view === 'day' && (
                <RecordList records={history} onRemove={remove} dark={dark} />
              )}
              {view === 'week' && (
                <WeekChart data={weekData} dark={dark} goal={goal} />
              )}
              {view === 'month' && (
                <MonthCalendar data={monthData} dark={dark} goal={goal} />
              )}
            </div>

            {/* Add Button */}
            <div className="flex justify-center mt-6">
              <AddButton onClick={add} dark={dark} size="lg" disabled={count >= goal} />
            </div>
          </motion.div>
        )}

        {page === 'settings' && (
          <SettingsPage
            key="settings"
            onBack={() => setPage('main')}
            dark={dark}
            onDarkChange={setDark}
            onLanguageClick={() => setPage('language')}
            onGoalClick={() => setPage('goal')}
            onAboutClick={() => setPage('about')}
          />
        )}

        {page === 'language' && (
          <LanguagePage
            key="language"
            onBack={() => setPage('settings')}
            dark={dark}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {page === 'goal' && (
          <GoalPage
            key="goal"
            onBack={() => setPage('settings')}
            dark={dark}
            goal={goal}
            onGoalChange={setGoal}
          />
        )}

        {page === 'about' && (
          <AboutPage
            key="about"
            onBack={() => setPage('settings')}
            dark={dark}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function getWeekData(history: { timestamp: Date; amount: number }[]): number[] {
  const data: number[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toDateString()
    const count = history
      .filter(r => new Date(r.timestamp).toDateString() === dateStr)
      .reduce((sum, r) => sum + r.amount, 0)
    data.push(count)
  }

  return data
}

function getMonthData(history: { timestamp: Date; amount: number }[]): Record<string, number> {
  const data: Record<string, number> = {}
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  history.forEach(r => {
    const date = new Date(r.timestamp)
    if (date.getFullYear() === year && date.getMonth() === month) {
      const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      data[dateStr] = (data[dateStr] || 0) + r.amount
    }
  })

  return data
}
