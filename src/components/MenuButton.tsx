import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  dark: boolean
}

/**
 * Menu button (three dots) for settings access
 */
export function MenuButton({ onClick, dark }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        dark ? 'bg-white/10 border border-white/20' : 'bg-white/30 border border-white/50'
      }`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <svg
        className={`w-5 h-5 ${dark ? 'text-white/80' : 'text-white'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </motion.button>
  )
}
