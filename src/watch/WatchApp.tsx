import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWaterData } from '../shared/hooks/useWaterData'
import { WatchWater } from './components/WatchWater'
import { WatchButtons } from './components/WatchButtons'

export default function WatchApp() {
  const { count, goal, level, dark, add } = useWaterData()

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
      <WatchWater level={level} dark={dark} />

      <div className="relative z-10 flex flex-col items-center">
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

        {count < goal && <WatchButtons onAdd={add} dark={dark} />}
      </div>
    </div>
  )
}
