import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaterData } from '../shared/hooks/useWaterData'
import { WaterCanvas, AddButton } from '../shared/components'

type View = 'main' | 'history' | 'calendar' | 'settings'

export default function WatchApp() {
  const { count, goal, level, dark, history, add, setDark } = useWaterData()
  const [view, setView] = useState<View>('main')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBackButton, setShowBackButton] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate calendar data for current week
  const getWeekData = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - dayOfWeek + i)
      days.push({
        day: ['日', '一', '二', '三', '四', '五', '六'][i],
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        count: Math.floor(Math.random() * 9), // Placeholder - should be from history
      })
    }
    return days
  }
  const weekData = getWeekData()

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

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        dark ? 'bg-[#0d1b2a]' : 'bg-[#f0f4f8]'
      }`}
      style={{
        borderRadius: isRound ? '50%' : '16px',
        overflow: 'hidden',
      }}
    >
      <WaterCanvas level={level} dark={dark} bubbles={false} waveAmplitude={0.8} />

      {/* Main View */}
      {view === 'main' && (
        <div className="relative z-10 flex flex-col items-center w-full px-4">
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
              <span className={`text-lg ${dark ? 'text-white' : 'text-[#1a365d]'}`}>×</span>
            ) : (
              <div className="flex flex-col gap-1">
                <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-[#1a365d]'}`} />
                <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-[#1a365d]'}`} />
                <div className={`w-1 h-1 rounded-full ${dark ? 'bg-white' : 'bg-[#1a365d]'}`} />
              </div>
            )}
          </button>

          {/* Count display */}
          <motion.div
            key={count}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className={`flex items-baseline gap-1 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
              <span className="text-5xl font-extralight">{count}</span>
              <span className="text-lg opacity-50">/{goal}</span>
            </div>
          </motion.div>

          {/* Add button */}
          {count < goal && (
            <div className="mt-6">
              <AddButton onAdd={add} dark={dark} size="lg" />
            </div>
          )}

          {/* Goal reached message */}
          {count >= goal && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 text-sm ${dark ? 'text-[#68d391]' : 'text-[#38a169]'}`}
            >
              🎉 Goal reached!
            </motion.p>
          )}
        </div>
      )}

      {/* History View */}
      {view === 'history' && (
        <div className="relative z-10 w-full h-full flex flex-col p-4">
          <div className={`text-center text-sm font-medium mb-4 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
            Today
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((r) => (
                  <div
                    key={r.id}
                    className={`flex justify-between px-3 py-2 rounded-lg ${
                      dark ? 'bg-white/5 text-white' : 'bg-black/5 text-[#1a365d]'
                    }`}
                  >
                    <span className="text-xs">
                      {new Date(r.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs">+{r.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center text-sm opacity-50 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
                No records
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
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20"
                style={{
                  background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span className={`text-lg ${dark ? 'text-white' : 'text-[#1a365d]'}`}>←</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="relative z-10 w-full h-full flex flex-col p-4">
          <div className={`text-center text-sm font-medium mb-4 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
            This Week
          </div>
          <div ref={scrollRef} className="flex-1 flex flex-col items-center justify-center">
            {/* Week bar chart */}
            <div className="flex items-end justify-center gap-2 h-32">
              {weekData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 rounded-t-lg ${
                      d.isToday
                        ? dark ? 'bg-[#4fc3f7]' : 'bg-[#0066ff]'
                        : dark ? 'bg-[#4fc3f7]/40' : 'bg-[#0066ff]/40'
                    }`}
                    style={{ height: `${(d.count / 8) * 100}%`, minHeight: '4px' }}
                  />
                  <span className={`text-xs ${d.isToday ? 'font-bold' : ''} ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className={`mt-4 text-xs ${dark ? 'text-white/60' : 'text-[#1a365d]/60'}`}>
              Total: {weekData.reduce((sum, d) => sum + d.count, 0)} cups this week
            </div>
          </div>
          {/* Floating Back button */}
          <AnimatePresence>
            {showBackButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => setView('main')}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20"
                style={{
                  background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span className={`text-lg ${dark ? 'text-white' : 'text-[#1a365d]'}`}>←</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Settings View */}
      {view === 'settings' && (
        <div className="relative z-10 w-full h-full flex flex-col p-4">
          <div className={`text-center text-sm font-medium mb-4 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
            Settings
          </div>
          <div className="flex-1">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`w-full flex justify-between items-center px-3 py-3 rounded-lg ${
                dark ? 'bg-white/5' : 'bg-black/5'
              }`}
            >
              <span className={`text-sm ${dark ? 'text-white' : 'text-[#1a365d]'}`}>Dark Mode</span>
              <div
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                  dark ? 'bg-[#4fc3f7]' : 'bg-[#cbd5e0]'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow"
                  animate={{ x: dark ? 16 : 0 }}
                />
              </div>
            </button>
          </div>
          {/* Floating Back button */}
          <AnimatePresence>
            {showBackButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => setView('main')}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20"
                style={{
                  background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span className={`text-lg ${dark ? 'text-white' : 'text-[#1a365d]'}`}>←</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

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
                dark ? 'bg-[#1b2838]' : 'bg-white'
              }`}
            >
              <button
                onClick={() => handleViewChange('history')}
                className={`w-32 h-12 rounded-2xl flex items-center justify-center text-sm font-medium ${
                  dark
                    ? 'bg-[#4fc3f7]/20 text-[#4fc3f7]'
                    : 'bg-[#0066ff]/10 text-[#0066ff]'
                }`}
              >
                History
              </button>
              <button
                onClick={() => handleViewChange('calendar')}
                className={`w-32 h-12 rounded-2xl flex items-center justify-center text-sm font-medium ${
                  dark
                    ? 'bg-[#4fc3f7]/20 text-[#4fc3f7]'
                    : 'bg-[#0066ff]/10 text-[#0066ff]'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => handleViewChange('settings')}
                className={`w-32 h-12 rounded-2xl flex items-center justify-center text-sm font-medium ${
                  dark
                    ? 'bg-white/10 text-white'
                    : 'bg-black/5 text-[#1a365d]'
                }`}
              >
                Settings
              </button>
              {/* Close button - bottom center */}
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,102,255,0.1)',
                }}
              >
                <span className={`text-lg ${dark ? 'text-white' : 'text-[#0066ff]'}`}>×</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
