import { motion } from 'framer-motion'

interface WaterLevelProps {
  progress: number
  height?: number
  className?: string
}

export function WaterLevel({ progress, height = 200, className = '' }: WaterLevelProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const waterHeight = (clampedProgress / 100) * height

  return (
    <div
      className={`relative overflow-hidden rounded-xl glass ${className}`}
      style={{ height }}
    >
      {/* Water surface */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500/80 via-cyan-400/60 to-cyan-300/40 dark:from-cyan-600/80 dark:via-cyan-500/60 dark:to-cyan-400/40"
        initial={{ height: 0 }}
        animate={{ height: waterHeight }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Wave effect */}
        <div className="absolute top-0 left-0 right-0 h-3">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
              fill="rgba(255,255,255,0.3)"
              className="animate-wave"
            />
          </svg>
        </div>

        {/* Secondary wave */}
        <div className="absolute top-1 left-0 right-0 h-2 opacity-50">
          <svg
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
              fill="rgba(255,255,255,0.2)"
              className="animate-wave-slow"
            />
          </svg>
        </div>
      </motion.div>

      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  )
}

interface WaterLevelCompactProps {
  progress: number
  size?: number
}

export function WaterLevelCompact({ progress, size = 140 }: WaterLevelCompactProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const waterHeight = (clampedProgress / 100) * size

  return (
    <div
      className="relative overflow-hidden rounded-full glass"
      style={{ width: size, height: size }}
    >
      {/* Water */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500/80 to-cyan-300/50 dark:from-cyan-600/80 dark:to-cyan-400/50"
        initial={{ height: 0 }}
        animate={{ height: waterHeight }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Mini wave */}
        <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z"
              fill="rgba(255,255,255,0.25)"
              className="animate-wave-mini"
            />
          </svg>
        </div>
      </motion.div>

      {/* Glass overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}