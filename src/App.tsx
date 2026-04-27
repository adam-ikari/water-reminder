import { useState, useEffect, useCallback, useMemo } from 'react'
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
  speed: number
  wobble: number
}

// 简单的波浪路径
function wavePath(time: number, amp: number, freq: number, baseY: number) {
  const w = 1200
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * w
    const y = baseY + amp * Math.sin((x / w) * freq * Math.PI * 2 + time)
    pts.push(`${x.toFixed(0)},${y.toFixed(1)}`)
  }
  return `M${pts.join(' L')} L${w},100 L0,100 Z`
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
  const [time, setTime] = useState(0)

  useEffect(() => {
    let id: number
    const animate = () => {
      setTime(t => t + 0.02)
      id = requestAnimationFrame(animate)
    }
    id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [])

  const waves = useMemo(() => ({
    front: wavePath(time * 1.5, 8, 3, 45),
    mid: wavePath(time * 1.2 + 1, 6, 2.5, 50),
    back: wavePath(time * 0.8 + 2, 5, 2, 55),
  }), [time])

  useEffect(() => {
    const spawn = () => {
      setBubbles(prev => [...prev.slice(-20), {
        id: Date.now() + Math.random(),
        x: 5 + Math.random() * 90,
        size: 4 + Math.random() * 8,
        speed: 0.5 + Math.random() * 0.5,
        wobble: Math.random() * 10 - 5,
      }])
    }
    const interval = setInterval(spawn, 600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const update = () => {
      setBubbles(prev => prev.map(b => ({ ...b, x: b.x + b.wobble * 0.01 })).filter(b => b.x > -5 && b.x < 105))
    }
    const interval = setInterval(update, 100)
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
  const waterY = typeof window !== 'undefined' ? window.innerHeight * (100 - progress) / 100 : 0
  const todayRecords = history.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).reverse()
  const groupedHistory = history.reduce((acc, r) => {
    const date = new Date(r.timestamp).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(r)
    return acc
  }, {} as Record<string, DrinkRecord[]>)

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200">
      <motion.div
        className="water-container"
        animate={{ y: waterY }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* 水面 */}
        <div className="water-surface">
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="wave-svg">
            <path d={waves.back} className="wave wave-back" />
            <path d={waves.mid} className="wave wave-mid" />
            <path d={waves.front} className="wave wave-front" />
          </svg>
          {/* 水面高光 */}
          <div className="surface-shine" />
        </div>

        {/* 水体 */}
        <div className="water-body">
          {/* 气泡 */}
          {bubbles.map(b => (
            <motion.div
              key={b.id}
              className="bubble"
              style={{ left: `${b.x}%`, width: b.size, height: b.size }}
              initial={{ bottom: '0%', opacity: 0 }}
              animate={{ bottom: '100%', opacity: [0, 0.7, 0.5, 0] }}
              transition={{ duration: 4 / b.speed, ease: 'linear' }}
            />
          ))}
          {/* 光线效果 */}
          <div className="water-light" />
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

            <button onClick={() => setShowHistory(true)} className="fixed bottom-8 left-8 text-white/60 hover:text-white/80 transition-colors">
              <History className="w-6 h-6" />
            </button>
            <button onClick={() => setShowSettings(true)} className="fixed bottom-8 right-8 text-white/60 hover:text-white/80 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </motion.div>
        ) : (
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
