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

  // Generate random bubbles
  useEffect(() => {
    const generateBubble = () => {
      const bubble: Bubble = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80,
        size: 4 + Math.random() * 8,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
      }
      setBubbles(prev => [...prev.slice(-15), bubble])
    }

    const interval = setInterval(generateBubble, 800)
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Fullscreen water */}
      <motion.div
        className="absolute inset-0 water-container"
        initial={{ y: '100%' }}
        animate={{ y: `${100 - progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Caustics - light scattering effect */}
        <div className="absolute inset-0 caustics" />

        {/* Back wave - water outline */}
        <div className="absolute top-0 inset-x-0 h-20 -translate-y-1/2 wave-back">
          <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,80 Q100,40 200,80 T400,80 T600,80 T800,80 T1000,80 T1200,80 L1200,160 L0,160 Z" fill="rgba(8,145,178,0.9)" />
          </svg>
        </div>

        {/* Middle wave - water surface (lighter) */}
        <div className="absolute top-0 inset-x-0 h-16 -translate-y-1/2 wave-middle">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,60 Q80,35 160,60 T320,58 T480,62 T640,60 T800,58 T960,62 T1120,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(34,211,238,0.7)" />
          </svg>
        </div>

        {/* Front wave - water outline */}
        <div className="absolute top-0 inset-x-0 h-14 -translate-y-1/2 wave-front">
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 Q60,30 120,50 T240,48 T360,52 T480,50 T600,48 T720,52 T840,50 T960,48 T1080,52 T1200,50 L1200,100 L0,100 Z" fill="rgba(103,232,249,0.5)" />
          </svg>
        </div>

        {/* Bubbles */}
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full bubble"
            style={{
              left: `${bubble.x}%`,
              width: bubble.size,
              height: bubble.size,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -300, opacity: [0, 0.8, 0.6, 0] }}
            transition={{ duration: bubble.duration, delay: bubble.delay, ease: 'easeOut' }}
          />
        ))}

        {/* Light rays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white/20 to-transparent transform -skew-x-12" />
          <div className="absolute top-0 left-1/2 w-2 h-full bg-gradient-to-b from-white/15 to-transparent transform skew-x-6" />
          <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-white/10 to-transparent transform -skew-x-3" />
        </div>
      </motion.div>

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
              <motion.span key={today} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-6xl font-bold text-white drop-shadow-lg">
                {today}
              </motion.span>
              <p className="text-white/80 mt-2">/ {goal} {t('glasses')}</p>
            </div>

            {/* Add button - liquid glass */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addDrink}
              className="liquid-button w-24 h-24 flex items-center justify-center"
            >
              <AnimatePresence>{isAnimating && <motion.div className="absolute inset-0 rounded-full bg-white/30" initial={{ scale: 1 }} animate={{ scale: 2, opacity: 0 }} />}</AnimatePresence>
              <Plus className="w-10 h-10 text-cyan-700" />
            </motion.button>

            {/* Bottom actions */}
            <button onClick={() => setShowHistory(true)} className="fixed bottom-8 left-8 text-white/70">
              <History className="w-6 h-6" />
            </button>
            <button onClick={() => setShowSettings(true)} className="fixed bottom-8 right-8 text-white/70">
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
              <h1 className="text-xl font-semibold text-cyan-800">{t('history')}</h1>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-cyan-700 text-sm mb-2">
                <Clock className="w-4 h-4" />
                {t('todayDrinks')}
              </div>
              <div className="liquid-card p-4 space-y-2">
                {todayRecords.length > 0 ? todayRecords.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-cyan-800">{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button onClick={() => removeDrink(r.id)} className="text-red-400 p-1"><X className="w-4 h-4" /></button>
                  </div>
                )) : <div className="text-cyan-600 text-center py-4">{t('noRecords')}</div>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedHistory)
                .filter(([date]) => date !== new Date().toLocaleDateString())
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, records]) => (
                  <div key={date} className="mb-4">
                    <div className="text-cyan-700 text-sm mb-2">{date}</div>
                    <div className="liquid-card p-3 space-y-1">
                      {records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span className="text-cyan-700">{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-cyan-500">+1 {t('glass')}</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-cyan-900/30 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="liquid-card p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
              <h2 className="font-semibold text-cyan-800 mb-4">{t('settings')}</h2>

              {/* Reminder toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-cyan-700">
                  {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  <span className="text-sm">{t('reminder')}</span>
                </div>
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-cyan-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${reminderEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Language */}
              <select value={i18n.language} onChange={e => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); }} className="w-full p-2 liquid-input">
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