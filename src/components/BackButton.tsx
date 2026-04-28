import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  dark: boolean
}

/**
 * Back button for navigation
 */
export function BackButton({ onClick, dark }: Props) {
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
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </motion.button>
  )
}
