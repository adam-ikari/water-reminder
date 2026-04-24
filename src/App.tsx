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

export default function App() {
  const { t, i18n } = useTranslation()
  const [today, setToday] = useState(0)
  const [goal] = useState(8)
  const [history, setHistory] = useState<DrinkRecord[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

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
        className="absolute inset-0 bg-gradient-to-t from-cyan-600 via-cyan-500/90 to-cyan-400/70"
        initial={{ y: '100%' }}
        animate={{ y: `${100 - progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Multiple wave layers */}
        <div className="absolute top-0 inset-x-0 h-12 -translate-y-1/2">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full animate-wave opacity-60">
            <path d="M0,40 C100,80 200,20 300,50 C400,80 500,30 600,60 C700,90 800,40 900,70 C1000,100 1100,50 1200,60 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>
        <div className="absolute top-1 inset-x-0 h-10 -translate-y-1/2">
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="w-full h-full animate-wave-slow opacity-40">
            <path d="M0,50 C150,90 250,20 400,55 C550,85 650,30 800,65 C950,95 1050,40 1200,50 L1200,100 L0,100 Z" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
        <div className="absolute top-2 inset-x-0 h-8 -translate-y-1/2">
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full animate-wave opacity-30">
            <path d="M0,30 C200,70 300,10 500,40 C700,70 800,20 1000,50 C1100,70 1150,40 1200,45 L1200,80 L0,80 Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
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
            <div className="fixed bottom-8 flex gap-4">
              <button onClick={() => setShowHistory(true)} className="liquid-button p-3">
                <History className="w-5 h-5 text-cyan-700" />
              </button>
              <button onClick={() => setShowSettings(true)} className="liquid-button p-3">
                <Settings className="w-5 h-5 text-cyan-700" />
              </button>
            </div>
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