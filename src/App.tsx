import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings, Bell, BellOff, X, Clock, History, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './i18n'

interface DrinkRecord {
  id: string
  timestamp: Date
  amount: number
}

interface Bubble {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  wobble: number
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [today, setToday] = useState(0)
  const [goal] = useState(8)
  const [history, setHistory] = useState<DrinkRecord[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  // Generate bubbles with 3D wobble
  useEffect(() => {
    const generateBubble = () => {
      const bubble: Bubble = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80,
        size: 3 + Math.random() * 6,
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 2,
        wobble: Math.random() * 20 - 10,
      }
      setBubbles(prev => [...prev.slice(-20), bubble])
    }

    const interval = setInterval(generateBubble, 600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('water')
    if (saved) {
      const data = JSON.parse(saved)
      setToday(data.today ?? 0)
      setHistory(data.history?.map((r: DrinkRecord) => ({ ...r, timestamp: new Date(r.timestamp) })) ?? [])
      setReminderEnabled(data.reminderEnabled ?? false)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('water', JSON.stringify({ today, goal, history, reminderEnabled }))
  }, [today, goal, history, reminderEnabled])

  const addDrink = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    setToday(p => p + 1)
    setHistory(p => [...p, { id: Date.now().toString(), timestamp: new Date(), amount: 1 }])
  }, [])

  const removeDrink = useCallback((id: string) => {
    setToday(p => Math.max(0, p - 1))
    setHistory(p => p.filter(r => r.id !== id))
  }, [])

  const progress = Math.min((today / goal) * 100, 100)
  const todayRecords = history.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).reverse()
  const groupedHistory = history.reduce((acc, r) => {
    const date = new Date(r.timestamp).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(r)
    return acc
  }, {} as Record<string, DrinkRecord[]>)

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200">
      {/* 3D Water container */}
      <div className="absolute inset-0" style={{ perspective: '1000px' }}>
        <motion.div
          className="absolute inset-0 water-3d"
          initial={{ y: '100%' }}
          animate={{ y: `${100 - progress}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Water surface with 3D transform */}
          <div className="water-surface">
            {/* Animated wave mesh - seamless loops */}
            <div className="wave-mesh">
              <svg viewBox="0 0 300 30" preserveAspectRatio="none" className="wave-svg wave-1">
                <path d="M0,15 Q15,8 30,15 T60,15 T90,15 T120,15 T150,15 T180,15 T210,15 T240,15 T270,15 T300,15 L300,30 L0,30 Z" />
              </svg>
              <svg viewBox="0 0 300 30" preserveAspectRatio="none" className="wave-svg wave-2">
                <path d="M0,15 Q20,22 40,15 T80,15 T120,15 T160,15 T200,15 T240,15 T280,15 T300,15 L300,30 L0,30 Z" />
              </svg>
              <svg viewBox="0 0 300 30" preserveAspectRatio="none" className="wave-svg wave-3">
                <path d="M0,15 Q10,10 20,15 T40,15 T60,15 T80,15 T100,15 T120,15 T140,15 T160,15 T180,15 T200,15 T220,15 T240,15 T260,15 T280,15 T300,15 L300,30 L0,30 Z" />
              </svg>
            </div>

            {/* Caustics light patterns */}
            <div className="caustics-3d" />

            {/* Reflection layer */}
            <div className="water-reflection" />
          </div>

          {/* Water body with depth gradient */}
          <div className="water-body">
            {/* Bubbles with 3D wobble */}
            {bubbles.map(bubble => (
              <motion.div
                key={bubble.id}
                className="bubble-3d"
                style={{
                  left: `${bubble.x}%`,
                  width: bubble.size,
                  height: bubble.size,
                }}
                initial={{ y: 0, opacity: 0, x: 0 }}
                animate={{
                  y: -500,
                  opacity: [0, 0.6, 0.4, 0],
                  x: [0, bubble.wobble, -bubble.wobble/2, bubble.wobble/3, 0]
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  ease: 'easeOut'
                }}
              />
            ))}

            {/* Depth layers */}
            <div className="depth-layer depth-1" />
            <div className="depth-layer depth-2" />
            <div className="depth-layer depth-3" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!showHistory ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex flex-col items-center justify-center gap-6"
          >
            {/* Counter */}
            <div className="text-center">
              <motion.span
                key={today}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-white drop-shadow-lg"
              >
                {today}
              </motion.span>
              <p className="text-white/80 mt-2">/ {goal} {t('glasses')}</p>
            </div>

            {/* Add button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addDrink}
              className="liquid-button w-24 h-24 flex items-center justify-center"
            >
              <AnimatePresence>
                {isAnimating && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/30"
                    initial={{ scale: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              <Plus className="w-10 h-10 text-sky-700" />
            </motion.button>

            {/* Bottom actions */}
            <button onClick={() => setShowHistory(true)} className="fixed bottom-8 left-8 text-white/60 hover:text-white/80 transition-colors">
              <History className="w-6 h-6" />
            </button>
            <button onClick={() => setShowSettings(true)} className="fixed bottom-8 right-8 text-white/60 hover:text-white/80 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </motion.div>
        ) : (
          /* History view */
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative min-h-screen flex flex-col p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setShowHistory(false)} className="liquid-button p-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-sky-800">{t('history')}</h1>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sky-700 text-sm mb-2">
                <Clock className="w-4 h-4" />
                {t('todayDrinks')}
              </div>
              <div className="liquid-card p-4 space-y-2">
                {todayRecords.length > 0 ? todayRecords.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-sky-800">{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button onClick={() => removeDrink(r.id)} className="text-red-400 p-1"><X className="w-4 h-4" /></button>
                  </div>
                )) : <div className="text-sky-600 text-center py-4">{t('noRecords')}</div>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedHistory)
                .filter(([date]) => date !== new Date().toLocaleDateString())
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, records]) => (
                  <div key={date} className="mb-4">
                    <div className="text-sky-700 text-sm mb-2">{date}</div>
                    <div className="liquid-card p-3 space-y-1">
                      {records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span className="text-sky-700">{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-sky-500">+1 {t('glass')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sky-900/30 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="liquid-card p-6 w-full max-w-xs"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-semibold text-sky-800 mb-4">{t('settings')}</h2>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sky-700">
                  {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  <span className="text-sm">{t('reminder')}</span>
                </div>
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-sky-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${reminderEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <select
                value={i18n.language}
                onChange={e => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); }}
                className="w-full p-2 liquid-input"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
              <button onClick={() => setShowSettings(false)} className="w-full mt-4 p-2 liquid-button">{t('save')}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}