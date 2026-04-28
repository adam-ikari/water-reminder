import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaterCanvas, AddButton, RecordList, WeekChart, MonthCalendar } from '../components'
import { SettingsPage, LanguagePage, GoalPage, AboutPage } from '../pages'
import { useWaterData } from '../hooks'
import { useTranslation } from 'react-i18next'

type TabType = 'home' | 'history'
type ViewType = 'day' | 'week' | 'month'
type PageType = 'main' | 'settings' | 'language' | 'goal' | 'about'

/**
 * Mobile portrait layout (width < 600)
 * Full-screen water animation with bottom Tab bar
 */
export function MobilePortraitLayout() {
  const { t } = useTranslation()
  const { count, goal, history, allHistory, dark, language, level, loaded, add, remove, setGoal, setDark, setLanguage } = useWaterData()
  const [tab, setTab] = useState<TabType>('home')
  const [view, setView] = useState<ViewType>('day')
  const [page, setPage] = useState<PageType>('main')
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)

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
            className="relative z-10 min-h-screen flex flex-col"
          >
            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {tab === 'home' && (
                <>
                  {/* Count Display */}
                  <motion.div
                    key={count}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className={`flex items-baseline justify-center gap-1 ${dark ? 'text-white' : 'text-white'}`}>
                      <span className="text-7xl font-extralight">{count}</span>
                      <span className="text-xl opacity-50">/{goal}{t('cups')}</span>
                    </div>
                  </motion.div>

                  {/* Add Button */}
                  {count < goal && (
                    <div className="mt-8">
                      <AddButton onClick={add} dark={dark} size="lg" disabled={count >= goal} />
                    </div>
                  )}

                  {/* Goal Reached */}
                  {count >= goal && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mt-6 text-lg ${dark ? 'text-[#4caf50]' : 'text-white'}`}
                    >
                      🎉 {t('goalReached')}
                    </motion.p>
                  )}
                </>
              )}

              {tab === 'history' && (
                <div className="w-full flex-1 flex flex-col pt-4">
                  {/* View Content */}
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
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="relative flex justify-center py-4">
              {/* Left: View Switch Button (only in history tab) */}
              {tab === 'history' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMenuOpen(!viewMenuOpen)}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center ${
                    dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'
                  } ${viewMenuOpen ? 'shadow-[0_0_12px_rgba(0,102,255,0.5)]' : ''}`}
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  {viewMenuOpen ? (
                    <span className={`text-lg ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}>×</span>
                  ) : (
                    <span className={`text-sm font-medium ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}>
                      {view === 'day' ? t('day') : view === 'week' ? t('week') : t('month')}
                    </span>
                  )}
                </motion.button>
              )}

              {/* Tab Bar */}
              <div
                className={`flex gap-1 p-1 rounded-2xl ${dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'}`}
                style={{ backdropFilter: 'blur(10px)' }}
              >
                <button
                  onClick={() => setTab('home')}
                  className={`px-5 py-2 rounded-xl text-sm transition-colors ${
                    tab === 'home'
                      ? dark ? 'bg-[#4fc3f7]/20 text-[#4fc3f7]' : 'bg-white/50 text-[#0288d1]'
                      : dark ? 'text-white/60' : 'text-white/80'
                  }`}
                >
                  {t('home')}
                </button>
                <button
                  onClick={() => setTab('history')}
                  className={`px-5 py-2 rounded-xl text-sm transition-colors ${
                    tab === 'history'
                      ? dark ? 'bg-[#4fc3f7]/20 text-[#4fc3f7]' : 'bg-white/50 text-[#0288d1]'
                      : dark ? 'text-white/60' : 'text-white/80'
                  }`}
                >
                  {t('history')}
                </button>
              </div>

              {/* Right: Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center ${
                  dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'
                } ${settingsMenuOpen ? 'shadow-[0_0_12px_rgba(0,102,255,0.5)]' : ''}`}
                style={{ backdropFilter: 'blur(10px)' }}
              >
                {settingsMenuOpen ? (
                  <span className={`text-lg ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}>×</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                  </div>
                )}
              </motion.button>
            </div>

            {/* View Menu Popup */}
            <AnimatePresence>
              {viewMenuOpen && tab === 'history' && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setViewMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute left-4 bottom-20 z-50 p-2 rounded-xl ${
                      dark ? 'bg-gray-800 border border-white/10' : 'bg-white/90 border border-black/10'
                    } shadow-xl`}
                    style={{ backdropFilter: 'blur(20px)' }}
                  >
                    {(['day', 'week', 'month'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setView(mode); setViewMenuOpen(false) }}
                        className={`block w-full px-4 py-2 text-sm rounded-lg transition-colors ${
                          view === mode
                            ? dark ? 'bg-[#4fc3f7]/20 text-[#4fc3f7]' : 'bg-[#0288d1]/10 text-[#0288d1]'
                            : dark ? 'text-white/80' : 'text-gray-700'
                        }`}
                      >
                        {mode === 'day' ? t('day') + t('today').slice(0, 2) : mode === 'week' ? t('week') + t('today').slice(0, 2) : t('month') + t('today').slice(0, 2)}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Settings Menu Popup */}
            <AnimatePresence>
              {settingsMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setSettingsMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-4 bottom-20 z-50 p-2 rounded-xl ${
                      dark ? 'bg-gray-800 border border-white/10' : 'bg-white/90 border border-black/10'
                    } shadow-xl`}
                    style={{ backdropFilter: 'blur(20px)' }}
                  >
                    <button
                      onClick={() => { setPage('settings'); setSettingsMenuOpen(false) }}
                      className={`block w-full px-4 py-2 text-sm rounded-lg transition-colors ${
                        dark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-black/5'
                      }`}
                    >
                      {t('settings')}
                    </button>
                    <button
                      onClick={() => { setPage('about'); setSettingsMenuOpen(false) }}
                      className={`block w-full px-4 py-2 text-sm rounded-lg transition-colors ${
                        dark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-black/5'
                      }`}
                    >
                      {t('about')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
