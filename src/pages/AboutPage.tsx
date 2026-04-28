import { motion } from 'framer-motion'
import { BackButton } from '../components'
import { useTranslation } from 'react-i18next'

interface Props {
  onBack: () => void
  dark: boolean
}

/**
 * About page with app info
 */
export function AboutPage({ onBack, dark }: Props) {
  const { t } = useTranslation()

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
          {t('about')}
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
          dark ? 'bg-[#4fc3f7]/20' : 'bg-[#0288d1]/20'
        }`}>
          <svg className={`w-12 h-12 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c-5.33 4.67-8 8.67-8 12 0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.33-2.67-7.33-8-12z" />
          </svg>
        </div>

        <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-white'}`}>
          {t('appName')}
        </h2>

        <p className={`text-sm mb-8 ${dark ? 'text-white/60' : 'text-white/80'}`}>
          v1.0.0
        </p>

        <div className={`w-full rounded-2xl p-6 ${dark ? 'bg-white/5' : 'bg-white/20'}`} style={{ backdropFilter: 'blur(20px)' }}>
          <p className={`text-center text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-white/80'}`}>
            {t('aboutDescription')}
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-xs ${dark ? 'text-white/40' : 'text-white/60'}`}>
            © 2026 Water Reminder
          </p>
        </div>
      </div>
    </motion.div>
  )
}
