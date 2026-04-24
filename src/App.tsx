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
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('water', JSON.stringify({ today, goal, history }))
  }, [today, goal, history])

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
    <div className="min-h-screen flex flex-col">
      {/* Main view */}
      <AnimatePresence mode="wait">
        {!showHistory ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            {/* Water container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-72 h-72 glass overflow-hidden"
            >
              <motion.div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-cyan-500 to-cyan-300"
                initial={{ height: 0 }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute top-0 inset-x-0 h-2">
                  <svg viewBox="0 0 100 10" className="w-full h-full animate-wave">
                    <path d="M0,5 Q25,10 50,5 T100,5 V10 H0 Z" fill="rgba(255,255,255,0.3)" />
                  </svg>
                </div>
              </motion.div>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span key={today} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-5xl font-bold">
                  {today}
                </motion.span>
                <span className="text-gray-500 mt-1">/ {goal} {t('glasses')}</span>
                <span className="text-cyan-600 text-sm mt-2">{progress.toFixed(0)}%</span>
              </div>
            </motion.div>

            {/* Add button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addDrink}
              className="mt-8 w-16 h-16 glass-primary flex items-center justify-center"
            >
              <AnimatePresence>{isAnimating && <motion.div className="absolute inset-0 rounded-full bg-cyan-400/30" initial={{ scale: 1 }} animate={{ scale: 2, opacity: 0 }} />}</AnimatePresence>
              <Plus className="w-7 h-7 text-white" />
            </motion.button>

            {/* Bottom actions */}
            <div className="fixed bottom-6 flex gap-4">
              <button onClick={() => setShowHistory(true)} className="glass-button p-3">
                <History className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => setReminderEnabled(!reminderEnabled)} className="glass-button p-3">
                {reminderEnabled ? <Bell className="w-5 h-5 text-cyan-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
              </button>
              <button onClick={() => setShowSettings(true)} className="glass-button p-3">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* History view - fullscreen */
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setShowHistory(false)} className="glass-button p-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">{t('history')}</h1>
            </div>

            {/* Today section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Clock className="w-4 h-4" />
                {t('todayDrinks')}
              </div>
              <div className="glass p-4 space-y-2">
                {todayRecords.length > 0 ? todayRecords.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button onClick={() => removeDrink(r.id)} className="text-red-400 p-1"><X className="w-4 h-4" /></button>
                  </div>
                )) : <div className="text-gray-400 text-center py-4">{t('noRecords')}</div>}
              </div>
            </div>

            {/* Past days */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedHistory)
                .filter(([date]) => date !== new Date().toLocaleDateString())
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, records]) => (
                  <div key={date} className="mb-4">
                    <div className="text-gray-500 text-sm mb-2">{date}</div>
                    <div className="glass p-3 space-y-1">
                      {records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-cyan-600">+1 {t('glass')}</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
              <h2 className="font-semibold mb-4">{t('settings')}</h2>
              <select value={i18n.language} onChange={e => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); }} className="w-full p-2 glass-input">
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
              <button onClick={() => setShowSettings(false)} className="w-full mt-4 p-2 glass-button">{t('save')}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}