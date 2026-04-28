import { useState } from 'react'
import { motion } from 'framer-motion'
import { BackButton } from '../components'
import { useTranslation } from 'react-i18next'

interface Props {
  onBack: () => void
  dark: boolean
  goal: number
  onGoalChange: (goal: number) => void
}

/**
 * Goal setting page with cup selection
 */
export function GoalPage({ onBack, dark, goal, onGoalChange }: Props) {
  const { t } = useTranslation()
  const [tempGoal, setTempGoal] = useState(goal)

  const handleSave = () => {
    onGoalChange(tempGoal)
    onBack()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen p-6 ${dark ? 'bg-[#0d1b2a]' : 'bg-white'}`}
    >
      <div className="flex items-center gap-4 mb-8">
        <BackButton onClick={onBack} dark={dark} />
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
          {t('dailyGoal')}
        </h1>
      </div>

      <div className={`rounded-2xl p-6 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
        <div className="text-center mb-6">
          <span className={`text-6xl font-bold ${dark ? 'text-[#4fc3f7]' : 'text-[#0066ff]'}`}>
            {tempGoal}
          </span>
          <span className={`text-xl ml-2 ${dark ? 'text-white/60' : 'text-gray-500'}`}>
            {t('cups')}
          </span>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTempGoal(Math.max(1, tempGoal - num))}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                dark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700'
              }`}
            >
              -{num}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTempGoal(Math.min(20, tempGoal + num))}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                dark ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700'
              }`}
            >
              +{num}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={`w-full mt-6 p-4 rounded-2xl font-bold ${
          dark ? 'bg-[#4fc3f7] text-white' : 'bg-[#0066ff] text-white'
        }`}
      >
        {t('save')}
      </motion.button>
    </motion.div>
  )
}
