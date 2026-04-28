import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaterCanvas, AddButton, RecordList, WeekChart, MonthCalendar, BackButton } from '../components'
import { useWaterData } from '../hooks'
import { useTranslation } from 'react-i18next'

type ViewType = 'day' | 'week' | 'month'
type PageType = 'main' | 'settings' | 'language' | 'goal' | 'about'

/**
 * Desktop split layout (width >= 600, height >= 500)
 * Card-based water display with side panel
 * Elements fixed size centered, not stretched
 */
export function DesktopSplitLayout() {
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
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-[#0d1b2a]' : 'bg-gradient-to-br from-white/60 to-white/30'}`}>
        <div className={`text-xl ${dark ? 'text-white' : 'text-gray-800'}`}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 ${dark ? 'bg-[#0d1b2a]' : 'bg-gradient-to-br from-white/60 to-white/30'}`} style={dark ? {} : { backdropFilter: 'blur(20px)' }}>
      <div className="w-full max-w-4xl flex gap-6 items-center justify-center">
        {/* Left: Water Card - Fixed size */}
        <motion.div
          className={`w-80 h-96 rounded-[32px] relative overflow-hidden flex-shrink-0 ${
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
              <div className={`flex items-baseline justify-center gap-2 ${dark ? 'text-white' : 'text-white'}`}>
                <span className="text-6xl font-extralight">{count}</span>
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
          </div>

          {/* Semi-transparent overlay when in settings */}
          {page !== 'main' && (
            <div className="absolute inset-0 bg-black/20 rounded-[32px]" />
          )}
        </motion.div>

        {/* Right: Panel - Fixed size */}
        <div className={`w-80 h-96 rounded-[32px] overflow-hidden relative flex-shrink-0 ${
          dark ? 'bg-white/5 border border-white/10' : 'bg-white/20 border border-white/30'
        }`} style={{ backdropFilter: 'blur(20px)' }}>
          <AnimatePresence mode="wait">
            {page === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col p-5"
              >
                {/* Title */}
                <div className={`text-sm font-medium mb-3 ${dark ? 'text-white/60' : 'text-white/80'}`}>
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
                <div className="relative flex justify-center mt-3 pt-3">
                  {/* Left: View Switch Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMenuOpen(!viewMenuOpen)}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center ${
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

                  {/* Right: Menu Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center ${
                      dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'
                    } ${settingsMenuOpen ? 'shadow-[0_0_12px_rgba(0,102,255,0.5)]' : ''}`}
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    {settingsMenuOpen ? (
                      <span className={`text-lg ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}>×</span>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                        <div className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                        <div className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
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
                        className={`absolute left-5 bottom-20 z-50 p-2 rounded-xl ${
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
                        className={`absolute right-5 bottom-20 z-50 p-2 rounded-xl ${
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
              <div className="h-full flex flex-col p-5">
                <div className={`text-lg font-medium mb-6 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('settings')}
                </div>
                <div className="flex-1 space-y-3">
                  <button
                    onClick={() => setDark(!dark)}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl ${
                      dark ? 'bg-white/5' : 'bg-white/20'
                    }`}
                  >
                    <span className={`text-sm ${dark ? 'text-white/80' : 'text-white'}`}>{t('darkMode')}</span>
                    <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${dark ? 'bg-[#4fc3f7]' : 'bg-white/50'}`}>
                      <motion.div
                        className="w-4 h-4 rounded-full bg-white shadow"
                        animate={{ x: dark ? 20 : 0 }}
                      />
                    </div>
                  </button>
                  <button
                    onClick={() => setPage('language')}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl ${
                      dark ? 'bg-white/5' : 'bg-white/20'
                    }`}
                  >
                    <span className={`text-sm ${dark ? 'text-white/80' : 'text-white'}`}>{t('language')}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${dark ? 'text-white/60' : 'text-white/80'}`}>
                        {language === 'zh' ? '中文' : 'English'}
                      </span>
                      <svg className={`w-4 h-4 ${dark ? 'text-white/60' : 'text-white/80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setPage('goal')}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl ${
                      dark ? 'bg-white/5' : 'bg-white/20'
                    }`}
                  >
                    <span className={`text-sm ${dark ? 'text-white/80' : 'text-white'}`}>{t('dailyGoal')}</span>
                    <span className={`text-sm ${dark ? 'text-white/60' : 'text-white/80'}`}>{goal} {t('cups')}</span>
                  </button>
                </div>
                <div className="flex justify-center mt-6">
                  <BackButton onClick={() => setPage('main')} dark={dark} />
                </div>
              </div>
            )}

            {page === 'language' && (
              <div className="h-full flex flex-col p-5">
                <div className={`text-lg font-medium mb-6 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('language')}
                </div>
                <div className="flex-1 space-y-3">
                  {(['zh', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setPage('settings') }}
                      className={`w-full flex justify-between items-center px-4 py-3 rounded-xl ${
                        dark ? 'bg-white/5' : 'bg-white/20'
                      }`}
                    >
                      <span className={`text-sm ${dark ? 'text-white/80' : 'text-white'}`}>
                        {lang === 'zh' ? '中文' : 'English'}
                      </span>
                      {language === lang && (
                        <div className={`w-2 h-2 rounded-full ${dark ? 'bg-[#4fc3f7]' : 'bg-[#0288d1]'}`} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <BackButton onClick={() => setPage('settings')} dark={dark} />
                </div>
              </div>
            )}

            {page === 'goal' && (
              <div className="h-full flex flex-col p-5">
                <div className={`text-lg font-medium mb-6 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('dailyGoal')}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className={`text-5xl font-bold ${dark ? 'text-[#4fc3f7]' : 'text-white'}`}>{goal}</div>
                  <div className="flex gap-3 mt-6">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setGoal(Math.max(1, goal - num))}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          dark ? 'bg-white/10 text-white/80' : 'bg-white/30 text-white'
                        }`}
                      >
                        -{num}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setGoal(Math.min(20, goal + num))}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          dark ? 'bg-white/10 text-white/80' : 'bg-white/30 text-white'
                        }`}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <BackButton onClick={() => setPage('settings')} dark={dark} />
                </div>
              </div>
            )}

            {page === 'about' && (
              <div className="h-full flex flex-col p-5">
                <div className={`text-lg font-medium mb-6 text-center ${dark ? 'text-white' : 'text-white'}`}>
                  {t('about')}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                    dark ? 'bg-[#4fc3f7]/20' : 'bg-white/30'
                  }`}>
                    <svg className={`w-8 h-8 ${dark ? 'text-[#4fc3f7]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2c-5.33 4.67-8 8.67-8 12 0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.33-2.67-7.33-8-12z" />
                    </svg>
                  </div>
                  <div className={`text-xl font-medium ${dark ? 'text-white' : 'text-white'}`}>{t('appName')}</div>
                  <div className={`text-sm mt-2 ${dark ? 'text-white/60' : 'text-white/80'}`}>v1.0.0</div>
                </div>
                <div className="flex justify-center mt-6">
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
