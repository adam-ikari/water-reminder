import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../i18n'

interface DrinkRecord {
  id: string
  timestamp: Date
  amount: number
}

// 全屏水容器（移动端/手表）
function FullscreenWater({ level, dark }: { level: number; dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentLevelRef = useRef(level)
  const targetLevelRef = useRef(level)

  useEffect(() => {
    targetLevelRef.current = level
  }, [level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth * 2
      canvas.height = window.innerHeight * 2
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const t = frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // 平滑过渡水位
      const diff = targetLevelRef.current - currentLevelRef.current
      currentLevelRef.current += diff * 0.03

      const displayLevel = currentLevelRef.current
      const waterH = h * displayLevel / 100
      const surfaceY = h - waterH

      if (displayLevel > 0.1) {
        // 水体渐变
        const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
        grad.addColorStop(0, dark ? '#4fc3f7' : '#81d4fa')
        grad.addColorStop(0.5, dark ? '#29b6f6' : '#4fc3f7')
        grad.addColorStop(1, dark ? '#0288d1' : '#29b6f6')

        // 波浪
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const y = surfaceY + Math.sin(x * 0.005 + t * 0.02) * 8 + Math.sin(x * 0.008 + t * 0.03) * 5
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.fillStyle = grad
        ctx.fill()

        // 水面高光
        ctx.globalAlpha = 0.3
        const hl = ctx.createLinearGradient(0, surfaceY - 20, 0, surfaceY + 40)
        hl.addColorStop(0, 'transparent')
        hl.addColorStop(0.5, dark ? '#b3e5fc' : '#e1f5fe')
        hl.addColorStop(1, 'transparent')
        ctx.beginPath()
        for (let x = 0; x <= w; x += 4) {
          const y = surfaceY + Math.sin(x * 0.005 + t * 0.02) * 8
          x === 0 ? ctx.moveTo(x, y - 20) : ctx.lineTo(x, y + 40)
        }
        ctx.lineTo(w, surfaceY - 20)
        ctx.fillStyle = hl
        ctx.fill()
        ctx.globalAlpha = 1

        // 气泡
        for (let i = 0; i < 8; i++) {
          const bx = w * (0.1 + i * 0.1) + Math.sin(t * 0.02 + i * 2) * 10
          const by = surfaceY + waterH * (0.2 + (i % 4) * 0.2) + Math.sin(t * 0.03 + i) * 5
          const br = 3 + Math.sin(t * 0.04 + i) * 2
          ctx.beginPath()
          ctx.arc(bx, by, br, 0, Math.PI * 2)
          ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />
}

// 卡片容器（桌面/平板）- 毛玻璃卡片 + 水效果
function CardWater({ level, dark }: { level: number; dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentLevelRef = useRef(level)
  const targetLevelRef = useRef(level)

  useEffect(() => {
    targetLevelRef.current = level
  }, [level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let animId: number

    const resize = () => {
      const container = canvas.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const t = frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // 平滑过渡水位
      const diff = targetLevelRef.current - currentLevelRef.current
      currentLevelRef.current += diff * 0.03
      const displayLevel = currentLevelRef.current

      // 毛玻璃卡片背景
      ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.35)'
      ctx.beginPath()
      ctx.roundRect(0, 0, w, h, 32)
      ctx.fill()

      // 卡片边框
      ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 水区域
      const waterH = h * displayLevel / 100
      const surfaceY = h - waterH

      if (displayLevel > 0.1) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(0, 0, w, h, 32)
        ctx.clip()

        // 水体渐变
        const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
        grad.addColorStop(0, dark ? '#4fc3f7' : '#81d4fa')
        grad.addColorStop(0.5, dark ? '#29b6f6' : '#4fc3f7')
        grad.addColorStop(1, dark ? '#0288d1' : '#29b6f6')

        // 波浪
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const y = surfaceY + Math.sin(x * 0.02 + t * 0.03) * 6 + Math.sin(x * 0.01 + t * 0.02) * 4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.fillStyle = grad
        ctx.fill()

        // 水面高光
        ctx.globalAlpha = 0.3
        const hl = ctx.createLinearGradient(0, surfaceY - 15, 0, surfaceY + 30)
        hl.addColorStop(0, 'transparent')
        hl.addColorStop(0.5, dark ? '#b3e5fc' : '#e1f5fe')
        hl.addColorStop(1, 'transparent')
        ctx.beginPath()
        for (let x = 0; x <= w; x += 4) {
          const y = surfaceY + Math.sin(x * 0.02 + t * 0.03) * 6
          x === 0 ? ctx.moveTo(x, y - 15) : ctx.lineTo(x, y + 30)
        }
        ctx.lineTo(w, surfaceY - 15)
        ctx.fillStyle = hl
        ctx.fill()
        ctx.globalAlpha = 1

        // 气泡
        for (let i = 0; i < 6; i++) {
          const bx = w * (0.15 + i * 0.12) + Math.sin(t * 0.02 + i * 2) * 8
          const by = surfaceY + waterH * (0.2 + (i % 3) * 0.25) + Math.sin(t * 0.03 + i) * 4
          const br = 2 + Math.sin(t * 0.04 + i) * 1.5
          ctx.beginPath()
          ctx.arc(bx, by, br, 0, Math.PI * 2)
          ctx.fillStyle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)'
          ctx.fill()
        }

        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark])

  return <canvas ref={canvasRef} className="w-full h-full rounded-[32px]" />
}

export default function AppMain() {
  const { t, i18n } = useTranslation()
  const [count, setCount] = useState(0)
  const [goal] = useState(8)
  const [history, setHistory] = useState<DrinkRecord[]>([])
  const [settings, setSettings] = useState(false)
  const [historyView, setHistoryView] = useState(false)
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('dark')
    return s ? s === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isWide, setIsWide] = useState(() => window.innerWidth > 600)

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth > 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const d = localStorage.getItem('water')
    if (d) {
      const { count: c, history: h } = JSON.parse(d)
      setCount(c ?? 0)
      setHistory(h?.map((r: DrinkRecord) => ({ ...r, timestamp: new Date(r.timestamp) })) ?? [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('water', JSON.stringify({ count, goal, history }))
  }, [count, history])

  useEffect(() => {
    localStorage.setItem('dark', String(dark))
  }, [dark])

  const add = useCallback(() => {
    setCount(c => Math.min(c + 1, goal))
    setHistory(h => [...h, { id: Date.now().toString(), timestamp: new Date(), amount: 1 }])
  }, [goal])

  const remove = useCallback((id: string) => {
    setCount(c => Math.max(0, c - 1))
    setHistory(h => h.filter(r => r.id !== id))
  }, [])

  const level = (count / goal) * 100
  const today = history.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).reverse()

  // 移动端/手表：全屏容器
  if (!isWide) {
    return (
      <div className={`min-h-screen flex flex-col ${dark ? 'bg-[#0d1b2a]' : 'bg-[#f0f4f8]'}`}>
        <FullscreenWater level={level} dark={dark} />

        {/* 主内容 */}
        <div className="relative flex-1 flex flex-col items-center justify-center">
          <motion.div
            key={count}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className={`flex items-baseline justify-center ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
              <span className="text-[100px] font-extralight leading-none">{count}</span>
              <span className="text-[40px] font-light mx-2 opacity-50">/</span>
              <span className="text-[40px] font-light opacity-50">{goal}</span>
            </div>
          </motion.div>

          {count >= goal && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-6 text-sm ${dark ? 'text-[#68d391]' : 'text-[#38a169]'}`}
            >
              🎉 {t('goalReached')}
            </motion.p>
          )}

          {count < goal && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={add}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                dark
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/30 border border-white/50'
              }`}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: dark
                  ? '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              <svg className={`w-8 h-8 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* 底部 */}
        <div className="flex justify-center gap-8 py-6">
          <button onClick={() => setHistoryView(true)} className={`text-sm ${dark ? 'text-white/40' : 'text-[#718096]'}`}>
            {t('history')}
          </button>
          <button onClick={() => setSettings(true)} className={`text-sm ${dark ? 'text-white/40' : 'text-[#718096]'}`}>
            {t('settings')}
          </button>
        </div>

        {/* 面板 */}
        <Panels
          historyView={historyView} setHistoryView={setHistoryView}
          settings={settings} setSettings={setSettings}
          dark={dark} setDark={setDark}
          today={today} remove={remove} i18n={i18n} t={t}
        />
      </div>
    )
  }

  // 桌面/平板：卡片容器
  return (
    <div className={`min-h-screen flex items-center justify-center p-8 ${dark ? 'bg-[#0d1b2a]' : 'bg-[#f0f4f8]'}`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <CardWater level={level} dark={dark} />

        {/* 叠加内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
          {/* 顶部 */}
          <div className="flex justify-end w-full">
            <button onClick={() => setSettings(true)} className={`p-2 rounded-full ${dark ? 'text-white/40' : 'text-[#718096]'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* 中间 */}
          <div className="flex flex-col items-center">
            <motion.div
              key={count}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className={`flex items-baseline justify-center ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
                <span className="text-6xl font-extralight leading-none">{count}</span>
                <span className="text-2xl font-light mx-1 opacity-50">/</span>
                <span className="text-2xl font-light opacity-50">{goal}</span>
              </div>
            </motion.div>

            {count < goal && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={add}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  dark
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/30 border border-white/50'
                }`}
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: dark
                    ? '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <svg className={`w-7 h-7 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            )}

            {count >= goal && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 text-sm ${dark ? 'text-[#68d391]' : 'text-[#38a169]'}`}
              >
                🎉 {t('goalReached')}
              </motion.p>
            )}
          </div>

          {/* 底部 */}
          <button onClick={() => setHistoryView(true)} className={`text-sm ${dark ? 'text-white/40' : 'text-[#718096]'}`}>
            {t('history')}
          </button>
        </div>
      </motion.div>

      {/* 面板 */}
      <Panels
        historyView={historyView} setHistoryView={setHistoryView}
        settings={settings} setSettings={setSettings}
        dark={dark} setDark={setDark}
        today={today} remove={remove} i18n={i18n} t={t}
      />
    </div>
  )
}

// 面板组件
function Panels({
  historyView, setHistoryView,
  settings, setSettings,
  dark, setDark,
  today, remove, i18n, t
}: {
  historyView: boolean; setHistoryView: (v: boolean) => void
  settings: boolean; setSettings: (v: boolean) => void
  dark: boolean; setDark: (v: boolean) => void
  today: DrinkRecord[]; remove: (id: string) => void
  i18n: { language: string; changeLanguage: (l: string) => void }
  t: (k: string) => string
}) {
  return (
    <>
      <AnimatePresence>
        {historyView && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={() => setHistoryView(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl ${dark ? 'bg-[#1b2838]' : 'bg-white'}`}
            >
              <div className={`w-10 h-1 rounded-full mx-auto mt-3 ${dark ? 'bg-white/20' : 'bg-black/10'}`} />
              <div className="p-6 pb-12 max-h-[60vh] overflow-y-auto">
                <h2 className={`text-lg font-medium mb-4 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>{t('today')}</h2>
                <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-[#243447]' : 'bg-[#f7fafc]'}`}>
                  {today.length > 0 ? today.map((r, i) => (
                    <div key={r.id} className={`flex items-center justify-between px-4 py-3 ${i < today.length - 1 ? (dark ? 'border-b border-white/5' : 'border-b border-black/5') : ''}`}>
                      <span className={dark ? 'text-white' : 'text-[#1a365d]'}>{r.timestamp.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      <button onClick={() => remove(r.id)} className={`p-1 ${dark ? 'text-[#fc8181]' : 'text-[#e53e3e]'}`}><X className="w-4 h-4" /></button>
                    </div>
                  )) : <p className={`py-8 text-center text-sm ${dark ? 'text-white/40' : 'text-[#718096]'}`}>{t('noRecords')}</p>}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settings && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={() => setSettings(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl ${dark ? 'bg-[#1b2838]' : 'bg-white'}`}
            >
              <div className={`w-10 h-1 rounded-full mx-auto mt-3 ${dark ? 'bg-white/20' : 'bg-black/10'}`} />
              <div className="p-6 pb-12">
                <h2 className={`text-lg font-medium mb-6 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>{t('settings')}</h2>

                <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-[#243447]' : 'bg-[#f7fafc]'}`}>
                  <button onClick={() => setDark(!dark)} className="w-full flex items-center justify-between px-4 py-3">
                    <span className={dark ? 'text-white' : 'text-[#1a365d]'}>{t('darkMode')}</span>
                    <div className={`w-12 h-7 rounded-full p-0.5 transition-colors ${dark ? 'bg-[#4fc3f7]' : 'bg-[#cbd5e0]'}`}>
                      <motion.div className="w-6 h-6 rounded-full bg-white shadow" animate={{ x: dark ? 20 : 0 }} />
                    </div>
                  </button>
                </div>

                <div className={`mt-3 rounded-2xl overflow-hidden ${dark ? 'bg-[#243447]' : 'bg-[#f7fafc]'}`}>
                  {['zh', 'en'].map((lang, i) => (
                    <button key={lang} onClick={() => { i18n.changeLanguage(lang); localStorage.setItem('lang', lang) }} className={`w-full flex items-center justify-between px-4 py-3 ${i === 0 ? (dark ? 'border-b border-white/5' : 'border-b border-black/5') : ''}`}>
                      <span className={dark ? 'text-white' : 'text-[#1a365d]'}>{lang === 'zh' ? '中文' : 'English'}</span>
                      {i18n.language === lang && <div className={`w-2 h-2 rounded-full ${dark ? 'bg-[#4fc3f7]' : 'bg-[#29b6f6]'}`} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
