import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaterCanvas, AddButton, RecordList, WeekChart, ViewSwitch, BackButton } from '../components'
import { SettingsPage, LanguagePage, GoalPage, AboutPage } from '../pages'
import { useWaterData } from '../hooks'
import { useTranslation } from 'react-i18next'

type View = 'main' | 'history' | 'settings' | 'language' | 'goal' | 'about'
type ViewMode = 'day' | 'week' | 'month'

/**
 * Watch layout for Android Watch
 * Full-screen menu navigation with compact UI
 */
export function WatchLayout() {
  const { t } = useTranslation()
  const { count, goal, level, dark, language, history, allHistory, loaded, add, setDark, setGoal, setLanguage } = useWaterData()
  const [view, setView] = useState<View>('main')
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBackButton, setShowBackButton] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const weekData = getWeekData(allHistory)

  // Detect round vs square screen
  const [isRound, setIsRound] = useState(false)
  useEffect(() => {
    const check = () => {
      const minDim = Math.min(window.innerWidth, window.innerHeight)
      setIsRound(minDim < 220)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Hide back button on scroll
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    let timeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      setShowBackButton(false)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowBackButton(true), 800)
    }

    scrollEl.addEventListener('scroll', handleScroll)
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll)
      clearTimeout(timeout)
    }
  }, [view])

  // Reset back button visibility when view changes
  useEffect(() => {
    setShowBackButton(true)
  }, [view])

  // Close menu when changing view
  const handleViewChange = (newView: View) => {
    setView(newView)
    setMenuOpen(false)
  }

  if (!loaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-bg-dark' : 'bg-gradient-to-br from-white/60 to-white/30'}`}>
        <div className={`text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        dark ? 'bg-bg-dark' : 'bg-gradient-to-br from-white/60 to-white/30'
      }`}
      style={{
        borderRadius: isRound ? '50%' : '16px',
        overflow: 'hidden',
        ...(dark ? {} : { backdropFilter: 'blur(20px)' })
      }}
    >
      <WaterCanvas level={level} dark={dark} mode="fullscreen" bubbles={false} waveAmplitude={0.8} />

      <AnimatePresence mode="wait">
        {/* Main View */}
        {view === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center w-full px-4"
          >
            {/* Menu button - top right */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20"
              style={{
                background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {menuOpen ? (
                <span className={`text-lg ${dark ? 'text-white' : 'text-white'}`}>×</span>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                  <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                  <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-white'}`} />
                </div>
              )}
            </button>

            {/* Count display */}
            <motion.div
              key={count}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className={`flex items-baseline gap-1 ${dark ? 'text-white' : 'text-white'}`}>
                <span className="text-5xl font-extralight">{count}</span>
                <span className="text-lg opacity-50">/{goal}</span>
              </div>
            </motion.div>

            {/* Add button */}
            {count < goal && (
              <div className="mt-6">
                <AddButton onClick={add} dark={dark} size="lg" disabled={count >= goal} />
              </div>
            )}

            {/* Goal reached message */}
            {count >= goal && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-success"
              >
                🎉 {t('goalReached')}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* History View */}
        {view === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-full flex flex-col p-4"
          >
            <div className={`text-center text-sm font-medium mb-2 ${dark ? 'text-white' : 'text-white'}`}>
              {viewMode === 'day' ? t('today') : viewMode === 'week' ? t('thisWeek') : t('thisMonth')}
            </div>

            {/* View switch */}
            <div className="flex justify-center mb-4">
              <ViewSwitch view={viewMode} onChange={setViewMode} dark={dark} />
            </div>

            {/* Content area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {viewMode === 'day' && (
                <RecordList records={history} onRemove={() => {}} dark={dark} />
              )}
              {viewMode === 'week' && (
                <WeekChart data={weekData} dark={dark} goal={goal} />
              )}
              {viewMode === 'month' && (
                <p className={`text-center text-sm opacity-50 ${dark ? 'text-white' : 'text-white'}`}>
                  {t('comingSoon')}
                </p>
              )}
            </div>

            {/* Floating Back button */}
            <AnimatePresence>
              {showBackButton && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={() => setView('main')}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
                >
                  <BackButton onClick={() => setView('main')} dark={dark} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Settings Views */}
        {view === 'settings' && (
          <SettingsPage
            key="settings"
            onBack={() => setView('main')}
            dark={dark}
            onDarkChange={setDark}
            onLanguageClick={() => setView('language')}
            onGoalClick={() => setView('goal')}
            onAboutClick={() => setView('about')}
          />
        )}

        {view === 'language' && (
          <LanguagePage
            key="language"
            onBack={() => setView('settings')}
            dark={dark}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {view === 'goal' && (
          <GoalPage
            key="goal"
            onBack={() => setView('settings')}
            dark={dark}
            goal={goal}
            onGoalChange={setGoal}
          />
        )}

        {view === 'about' && (
          <AboutPage
            key="about"
            onBack={() => setView('settings')}
            dark={dark}
          />
        )}
      </AnimatePresence>

      {/* Full-screen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && view === 'main' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              style={{ background: dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)' }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 ${
                dark ? 'bg-bg-dark' : 'bg-gradient-to-br from-white/60 to-white/30'
              }`}
            >
              <button
                onClick={() => handleViewChange('history')}
                className={`w-32 h-12 rounded-2xl flex items-center justify-center text-sm font-medium ${
                  dark
                    ? 'bg-accent/20 text-accent'
                    : 'bg-white/30 text-white'
                }`}
              >
                {t('history')}
              </button>
              <button
                onClick={() => handleViewChange('settings')}
                className={`w-32 h-12 rounded-2xl flex items-center justify-center text-sm font-medium ${
                  dark
                    ? 'bg-white/10 text-white'
                    : 'bg-white/30 text-white'
                }`}
              >
                {t('settings')}
              </button>
              {/* Close button - bottom center */}
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                }}
              >
                <span className={`text-lg ${dark ? 'text-white' : 'text-white'}`}>×</span>
              </button>
            </motion.div>
          </>
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
