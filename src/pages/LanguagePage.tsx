import { motion } from 'framer-motion'
import { BackButton } from '../components'
import { useTranslation } from 'react-i18next'

interface Props {
  onBack: () => void
  dark: boolean
  language: 'zh' | 'en'
  onLanguageChange: (lang: 'zh' | 'en') => void
}

/**
 * Language selection page
 */
export function LanguagePage({ onBack, dark, language, onLanguageChange }: Props) {
  const { t } = useTranslation()

  const languages = [
    { key: 'zh' as const, label: '中文' },
    { key: 'en' as const, label: 'English' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <BackButton onClick={onBack} dark={dark} />
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-white'}`}>
          {t('language')}
        </h1>
      </div>

      <div className="space-y-4">
        {languages.map((lang) => (
          <motion.button
            key={lang.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLanguageChange(lang.key)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl ${
              dark ? 'bg-white/5' : 'bg-white/20'
            }`}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <span className={dark ? 'text-white/80' : 'text-white'}>{lang.label}</span>
            {language === lang.key && (
              <svg className={`w-5 h-5 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
