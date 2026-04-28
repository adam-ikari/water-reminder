import { motion } from 'framer-motion'
import { BackButton } from '../components'
import { useTranslation } from 'react-i18next'

interface Props {
  onBack: () => void
  dark: boolean
  onDarkChange: (dark: boolean) => void
  onLanguageClick: () => void
  onGoalClick: () => void
  onAboutClick: () => void
}

/**
 * Settings page with dark mode, language, goal, and about options
 */
export function SettingsPage({ onBack, dark, onDarkChange, onLanguageClick, onGoalClick, onAboutClick }: Props) {
  const { t } = useTranslation()

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
          {t('settings')}
        </h1>
      </div>

      <div className="space-y-4">
        <SettingsItem
          label={t('darkMode')}
          dark={dark}
          onClick={() => onDarkChange(!dark)}
          rightElement={
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${dark ? 'bg-[#4fc3f7]' : 'bg-white/30'}`}>
              <motion.div
                animate={{ x: dark ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-4 h-4 rounded-full bg-white"
              />
            </div>
          }
        />

        <SettingsItem
          label={t('language')}
          dark={dark}
          onClick={onLanguageClick}
          rightElement={
            <svg className={`w-5 h-5 ${dark ? 'text-white/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        />

        <SettingsItem
          label={t('dailyGoal')}
          dark={dark}
          onClick={onGoalClick}
          rightElement={
            <svg className={`w-5 h-5 ${dark ? 'text-white/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        />

        <SettingsItem
          label={t('about')}
          dark={dark}
          onClick={onAboutClick}
          rightElement={
            <svg className={`w-5 h-5 ${dark ? 'text-white/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        />
      </div>
    </motion.div>
  )
}

interface SettingsItemProps {
  label: string
  dark: boolean
  onClick: () => void
  rightElement?: React.ReactNode
}

function SettingsItem({ label, dark, onClick, rightElement }: SettingsItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl ${
        dark ? 'bg-white/10' : 'bg-gray-100'
      }`}
    >
      <span className={dark ? 'text-white/80' : 'text-gray-900'}>{label}</span>
      {rightElement}
    </motion.button>
  )
}
