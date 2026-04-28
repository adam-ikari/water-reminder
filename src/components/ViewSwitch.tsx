import { motion } from 'framer-motion'

type ViewType = 'day' | 'week' | 'month'

interface Props {
  view: ViewType
  onChange: (view: ViewType) => void
  dark: boolean
}

const views: { key: ViewType; label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
]

/**
 * View switch button for day/week/month views
 */
export function ViewSwitch({ view, onChange, dark }: Props) {
  return (
    <div className={`rounded-full p-1 flex ${dark ? 'bg-white/10' : 'bg-white/20'}`} style={{ backdropFilter: 'blur(20px)' }}>
      {views.map((item) => (
        <motion.button
          key={item.key}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(item.key)}
          className={`relative px-4 py-2 rounded-full text-sm transition-colors ${
            view === item.key
              ? dark ? 'text-white' : 'text-accent'
              : dark ? 'text-white/60' : 'text-white/80'
          }`}
        >
          {view === item.key && (
            <motion.div
              layoutId="view-indicator"
              className={`absolute inset-0 rounded-full ${dark ? 'bg-white/20' : 'bg-white'}`}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
