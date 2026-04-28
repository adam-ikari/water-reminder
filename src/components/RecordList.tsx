import { motion, AnimatePresence } from 'framer-motion'
import type { DrinkRecord } from '../hooks/types'

interface Props {
  records: DrinkRecord[]
  onRemove: (id: string) => void
  dark: boolean
}

/**
 * Record list for day view
 * Shows drink records with time and remove action
 */
export function RecordList({ records, onRemove, dark }: Props) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`rounded-2xl p-4 ${dark ? 'bg-white/5' : 'bg-white/20'}`} style={{ backdropFilter: 'blur(20px)' }}>
      <AnimatePresence initial={false}>
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between py-3 ${
              index !== records.length - 1 ? `border-b ${dark ? 'border-white/10' : 'border-white/20'}` : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? 'bg-[#4fc3f7]/20' : 'bg-[#0288d1]/20'}`}>
                <svg className={`w-4 h-4 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c-5.33 4.67-8 8.67-8 12 0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.33-2.67-7.33-8-12z" />
                </svg>
              </div>
              <span className={`text-sm ${dark ? 'text-white/80' : 'text-white'}`}>
                {formatTime(new Date(record.timestamp))}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(record.id)}
              className={`p-2 rounded-full ${dark ? 'hover:bg-white/10' : 'hover:bg-white/20'}`}
            >
              <svg className={`w-4 h-4 ${dark ? 'text-white/60' : 'text-white/80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
      {records.length === 0 && (
        <div className={`py-8 text-center ${dark ? 'text-white/40' : 'text-white/60'}`}>
          暂无记录
        </div>
      )}
    </div>
  )
}
