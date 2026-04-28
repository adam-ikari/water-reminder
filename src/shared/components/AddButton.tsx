import { motion } from 'framer-motion'

interface Props {
  onAdd: () => void
  dark: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { button: 'w-12 h-12', icon: 'w-6 h-6' },
  md: { button: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { button: 'w-16 h-16', icon: 'w-8 h-8' },
}

/**
 * Shared add water button for all platforms
 * Used by: Mobile, Desktop card, Watch
 */
export function AddButton({ onAdd, dark, size = 'md' }: Props) {
  const { button, icon } = sizeMap[size]

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onAdd}
      className={`${button} rounded-full flex items-center justify-center ${
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
      <svg
        className={`${icon} ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  )
}
