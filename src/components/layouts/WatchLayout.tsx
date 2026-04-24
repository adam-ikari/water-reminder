import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import { WaterLevelCompact } from '../WaterLevel'

interface WatchLayoutProps {
  today: number
  goal: number
  progress: number
  isAnimating: boolean
  onAddDrink: () => void
  onOpenSettings: () => void
}

export function WatchLayout({
  today,
  goal,
  progress,
  isAnimating,
  onAddDrink,
  onOpenSettings,
}: WatchLayoutProps) {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100 dark:from-slate-900 dark:via-sky-950 dark:to-blue-950">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-[180px] h-[180px] glass-watch flex items-center justify-center"
      >
        {/* Water level container */}
        <div className="absolute inset-3 overflow-hidden rounded-full">
          <WaterLevelCompact progress={progress} size={150} />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 text-center">
          <motion.div
            key={today}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-gray-800 dark:text-white drop-shadow-sm"
          >
            {today}
          </motion.div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            / {goal}
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
            {progress.toFixed(0)}%
          </div>
        </div>

        {/* Add button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAddDrink}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 glass-primary flex items-center justify-center"
        >
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="absolute inset-0 rounded-full bg-cyan-400/30"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
          <Plus className="w-5 h-5 text-white relative z-10" />
        </motion.button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="absolute -top-1 -right-1 w-8 h-8 glass-button flex items-center justify-center"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </motion.div>
    </div>
  )
}