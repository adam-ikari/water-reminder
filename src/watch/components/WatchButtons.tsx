import { motion } from 'framer-motion'

interface Props {
  onAdd: () => void
  dark: boolean
}

export function WatchButtons({ onAdd, dark }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onAdd}
      className={`w-16 h-16 rounded-full flex items-center justify-center mt-6 ${
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
        className={`w-8 h-8 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  )
}
