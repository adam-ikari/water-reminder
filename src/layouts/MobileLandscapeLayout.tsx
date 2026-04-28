import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaterCanvas, AddButton, RecordList, WeekChart, MonthCalendar, ViewSwitch, MenuButton } from '../components'
import { SettingsPage, LanguagePage, GoalPage, AboutPage } from '../pages'
import { useWaterData } from '../hooks'
import { useTranslation } from 'react-i18next'

type ViewType = 'day' | 'week' | 'month'
type PageType = 'main' | 'settings' | 'language' | 'goal' | 'about'

/**
 * Mobile landscape layout (width >= 600, height < 500)
 * Side-by-side water animation and controls
 */
export function MobileLandscapeLayout() {
  const { t } = useTranslation()
  const { count, goal, history, allHistory, dark, language, level, loaded, add, remove, setGoal, setDark, setLanguage } = useWaterData()
  const [view, setView] = useState<ViewType>('day')
  const [page, setPage] = useState<PageType>('main')

  const weekData = getWeekData(allHistory)
  const monthData = getMonthData(allHistory)

  if (!loaded) {
    return (
      <div className={`h-screen flex items-center justify-center ${dark ? 'bg-gray-900' : 'bg-gradient-to-r from-sky-400 to-blue-500'}`}>
        <div className={`text-xl ${dark ? 'text-white' : 'text-white'}`}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex ${dark ? 'bg-gray-900' : 'bg-gradient-to-r from-sky-400 to-blue-500'}`}>
      {/* Left: Water Animation */}
      <div className="w-1/2 relative">
        <WaterCanvas level={level} dark={dark} mode="fullscreen" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className={`text-5xl font-bold ${dark ? 'text-white' : 'text-white'}`}>
              {count}/{goal}
            </h1>
            <p className={`text-sm mt-2 ${dark ? 'text-white/60' : 'text-white/80'}`}>
              {t('cupsToday')}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-1/2 relative z-10 flex flex-col p-4">
        <AnimatePresence mode="wait">
          {page === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <ViewSwitch view={view} onChange={setView} dark={dark} />
                <MenuButton onClick={() => setPage('settings')} dark={dark} />
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
              <div className="flex justify-center mt-4">
                <AddButton onClick={add} dark={dark} size="md" disabled={count >= goal} />
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
