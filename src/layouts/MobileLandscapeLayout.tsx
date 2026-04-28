import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaterCanvas, AddButton, RecordList, WeekChart, MonthCalendar, BackButton } from '../components'
import { useWaterData } from '../hooks'
import { useTranslation } from 'react-i18next'

type ViewType = 'day' | 'week' | 'month'
type PageType = 'main' | 'settings' | 'language' | 'goal' | 'about'

/**
 * Mobile landscape layout (width >= 600, height < 500)
 * Side-by-side: left card (water + add), right panel (history/settings)
 * Tab bar hidden - left card is the home
 */
export function MobileLandscapeLayout() {
  const { t } = useTranslation()
  const { count, goal, history, allHistory, dark, language, level, loaded, add, remove, setGoal, setDark, setLanguage } = useWaterData()
  const [view, setView] = useState<ViewType>('day')
  const [page, setPage] = useState<PageType>('main')
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)

  const weekData = getWeekData(allHistory)
  const monthData = getMonthData(allHistory)

  if (!loaded) {
    return (
      <div className={`h-screen flex items-center justify-center ${dark ? 'bg-bg-dark' : 'bg-gradient-to-br from-white/60 to-white/30'}`}>
        <div className={`text-xl ${dark ? 'text-white' : 'text-gray-800'}`}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex ${dark ? 'bg-bg-dark' : 'bg-gradient-to-br from-white/60 to-white/30'}`} style={dark ? {} : { backdropFilter: 'blur(20px)' }}>
      {/* Left: Water Card - Always visible */}
      <div className="w-1/2 relative flex items-center justify-center p-4">
        <motion.div
          className={`w-full max-w-[200px] h-full max-h-[300px] rounded-2xl relative overflow-hidden ${
            dark ? 'bg-white/5 border border-white/10' : 'bg-white/20 border border-white/30'
          }`}
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <WaterCanvas level={level} dark={dark} mode="card" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={count}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className={`flex items-baseline justify-center gap-1 ${dark ? 'text-white' : 'text-white'}`}>
                <span className="text-4xl font-extralight">{count}</span>
                <span className="text-sm opacity-50">/{goal}{t('cups')}</span>
              </div>
            </motion.div>

            {/* Add Button */}
            {count < goal && (
              <div className="mt-6">
                <AddButton onClick={add} dark={dark} size="md" disabled={count >= goal} />
              </div>
            )}

            {/* Goal Reached */}
            {count >= goal && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-success"
              >
                🎉 {t('goalReached')}
              </motion.p>
            )}
          </div>

          {/* Semi-transparent overlay when in settings */}
          {page !== 'main' && (
            <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          )}
        </motion.div>
      </div>

      {/* Right: Panel */}
      <div className="w-1/2 relative z-10 flex items-center justify-center p-4">
        <div className={`w-full max-w-[200px] h-full max-h-[300px] rounded-2xl overflow-hidden relative ${
          dark ? 'bg-white/5 border border-white/10' : 'bg-white/20 border border-white/30'
        }`} style={{ backdropFilter: 'blur(20px)' }}>
          <AnimatePresence mode="wait">
            {page === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col p-3"
              >
                {/* Title */}
                <div className={`text-xs font-medium mb-2 ${dark ? 'text-white/60' : 'text-white/80'}`}>
                  {t('today')}
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

                {/* Bottom Navigation */}
                <div className="relative flex justify-center mt-2 pt-2">
                  {/* Left: View Switch Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMenuOpen(!viewMenuOpen)}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center ${
                      dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'
                    } ${viewMenuOpen ? 'shadow-[0_0_10px_rgba(0,102,255,0.5)]' : ''}`}
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    {viewMenuOpen ? (
                      <span className="text-base text-accent">×</span>
                    ) : (
                      <span className="text-xs font-medium text-accent">
                        {view === 'day' ? t('day') : view === 'week' ? t('week') : t('month')}
                      </span>
                    )}
                  </motion.button>

                  {/* Right: Menu Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center ${
                      dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'
                    } ${settingsMenuOpen ? 'shadow-[0_0_10px_rgba(0,102,255,0.5)]' : ''}`}
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    {settingsMenuOpen ? (
                      <span className="text-base text-accent">×</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                        <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                        <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                      </div>
                    )}
                  </motion.button>
                </div>

                {/* View Menu Popup */}
                <AnimatePresence>
                  {viewMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40"
                        onClick={() => setViewMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute left-3 bottom-16 z-50 p-1.5 rounded-lg ${
                          dark ? 'bg-gray-800 border border-white/10' : 'bg-white/90 border border-black/10'
                        } shadow-xl`}
                        style={{ backdropFilter: 'blur(20px)' }}
                      >
                        {(['day', 'week', 'month'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => { setView(mode); setViewMenuOpen(false) }}
                            className={`block w-full px-3 py-1.5 text-xs rounded-md transition-colors ${
                              view === mode
                                ? 'bg-accent/20 text-accent'
                                : dark ? 'text-white/80' : 'text-gray-700'
                            }`}
                          >
                            {mode === 'day' ? t('day') : mode === 'week' ? t('week') : t('month')}
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
                        className="absolute inset-0 z-40"
                        onClick={() => setSettingsMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-3 bottom-16 z-50 p-1.5 rounded-lg ${
                          dark ? 'bg-gray-800 border border-white/10' : 'bg-white/90 border border-black/10'
                        } shadow-xl`}
                        style={{ backdropFilter: 'blur(20px)' }}
                      >
                        <button
                          onClick={() => { setPage('settings'); setSettingsMenuOpen(false) }}
                          className={`block w-full px-3 py-1.5 text-xs rounded-md transition-colors ${
                            dark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-black/5'
                          }`}
                        >
                          {t('settings')}
                        </button>
                        <button
                          onClick={() => { setPage('about'); setSettingsMenuOpen(false) }}
                          className={`block w-full px-3 py-1.5 text-xs rounded-md transition-colors ${
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
              <div className="h-full flex flex-col p-3">
                <div className={`text-xs font-medium mb-3 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('settings')}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    onClick={() => setDark(!dark)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg ${
                      dark ? 'bg-white/5' : 'bg-white/20'
                    }`}
                  >
                    <span className={`text-xs ${dark ? 'text-white/80' : 'text-white'}`}>{t('darkMode')}</span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${dark ? 'bg-accent' : 'bg-white/50'}`}>
                      <motion.div
                        className="w-3 h-3 rounded-full bg-white shadow"
                        animate={{ x: dark ? 16 : 0 }}
                      />
                    </div>
                  </button>
                  <button
                    onClick={() => setPage('language')}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg ${
                      dark ? 'bg-white/5' : 'bg-white/20'
                    }`}
                  >
                    <span className={`text-xs ${dark ? 'text-white/80' : 'text-white'}`}>{t('language')}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${dark ? 'text-white/60' : 'text-white/80'}`}>
                        {language === 'zh' ? '中文' : 'English'}
                      </span>
                      <svg className={`w-3 h-3 ${dark ? 'text-white/60' : 'text-white/80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setPage('goal')}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg ${
                      dark ? 'bg-white/5' : 'bg-white/20'
                    }`}
                  >
                    <span className={`text-xs ${dark ? 'text-white/80' : 'text-white'}`}>{t('dailyGoal')}</span>
                    <span className={`text-xs ${dark ? 'text-white/60' : 'text-white/80'}`}>{goal} {t('cups')}</span>
                  </button>
                </div>
                {/* Back Button */}
                <div className="flex justify-center mt-3">
                  <BackButton onClick={() => setPage('main')} dark={dark} />
                </div>
              </div>
            )}

            {page === 'language' && (
              <div className="h-full flex flex-col p-3">
                <div className={`text-xs font-medium mb-3 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('language')}
                </div>
                <div className="flex-1 space-y-2">
                  {(['zh', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setPage('settings') }}
                      className={`w-full flex justify-between items-center px-3 py-2 rounded-lg ${
                        dark ? 'bg-white/5' : 'bg-white/20'
                      }`}
                    >
                      <span className={`text-xs ${dark ? 'text-white/80' : 'text-white'}`}>
                        {lang === 'zh' ? '中文' : 'English'}
                      </span>
                      {language === lang && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center mt-3">
                  <BackButton onClick={() => setPage('settings')} dark={dark} />
                </div>
              </div>
            )}

            {page === 'goal' && (
              <div className="h-full flex flex-col p-3">
                <div className={`text-xs font-medium mb-3 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('dailyGoal')}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-accent">{goal}</div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setGoal(Math.max(1, goal - 1))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        dark ? 'bg-white/10' : 'bg-white/20'
                      }`}
                    >
                      <span className={dark ? 'text-white' : 'text-white'}>-</span>
                    </button>
                    <button
                      onClick={() => setGoal(Math.min(20, goal + 1))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        dark ? 'bg-white/10' : 'bg-white/20'
                      }`}
                    >
                      <span className={dark ? 'text-white' : 'text-white'}>+</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-center mt-3">
                  <BackButton onClick={() => setPage('settings')} dark={dark} />
                </div>
              </div>
            )}

            {page === 'about' && (
              <div className="h-full flex flex-col p-3">
                <div className={`text-xs font-medium mb-3 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('about')}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className={`text-lg font-medium ${dark ? 'text-white' : 'text-white'}`}>{t('appName')}</div>
                  <div className={`text-xs mt-1 ${dark ? 'text-white/60' : 'text-white/80'}`}>v1.0.0</div>
                </div>
                <div className="flex justify-center mt-3">
                  <BackButton onClick={() => setPage('settings')} dark={dark} />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
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
