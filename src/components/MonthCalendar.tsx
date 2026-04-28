import { useMemo } from 'react'

interface Props {
  data: Record<string, number>
  dark: boolean
  goal: number
  onDayClick?: (date: string) => void
}

/**
 * Month calendar grid component
 * Shows daily water intake for current month
 */
export function MonthCalendar({ data, dark, goal, onDayClick }: Props) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: Array<{ date: string | null; day: number; value: number; isToday: boolean }> = []

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, day: 0, value: 0, isToday: false })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        date: dateStr,
        day: i,
        value: data[dateStr] || 0,
        isToday: i === today.getDate(),
      })
    }

    return days
  }, [year, month, data, today])

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className={`rounded-2xl p-4 ${dark ? 'bg-white/5' : 'bg-white/20'}`} style={{ backdropFilter: 'blur(20px)' }}>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className={`text-center text-xs py-1 ${dark ? 'text-white/40' : 'text-white/60'}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((item, index) => {
          if (!item.date) {
            return <div key={index} className="aspect-square" />
          }

          const isGoalMet = item.value >= goal
          const opacity = item.value > 0 ? Math.min(0.3 + (item.value / goal) * 0.7, 1) : 0

          return (
            <button
              key={index}
              onClick={() => onDayClick?.(item.date)}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
                item.isToday
                  ? `ring-2 ${dark ? 'ring-[#4fc3f7]' : 'ring-[#0288d1]'}`
                  : ''
              } ${dark ? 'hover:bg-white/10' : 'hover:bg-white/20'}`}
            >
              {item.value > 0 && (
                <div
                  className={`absolute inset-0 rounded-lg ${isGoalMet ? 'bg-[#4caf50]' : (dark ? 'bg-[#4fc3f7]' : 'bg-[#0288d1]')}`}
                  style={{ opacity }}
                />
              )}
              <span className={`relative z-10 ${item.isToday ? (dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]') : (dark ? 'text-white/80' : 'text-white')}`}>
                {item.day}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
