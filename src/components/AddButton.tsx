import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  dark: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const sizeMap = {
  sm: { button: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { button: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { button: 'w-16 h-16', icon: 'w-8 h-8' },
}

/**
 * Shared add water button for all platforms
 * Features: self-glowing effect, tap animation
 */
export function AddButton({ onClick, dark, size = 'md', disabled = false }: Props) {
  const { button, icon } = sizeMap[size]

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className={`${button} rounded-full flex items-center justify-center ${
        dark
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/30 border border-white/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: disabled
          ? undefined
          : '0 0 16px var(--accent-glow)',
      }}
    >
      <svg
        className={`${icon} text-accent`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  )
}
