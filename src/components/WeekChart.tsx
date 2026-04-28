import { useMemo } from 'react'

interface Props {
  data: number[]
  dark: boolean
  goal: number
}

/**
 * Week bar chart component
 * Shows last 7 days of water intake
 */
export function WeekChart({ data, dark, goal }: Props) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date().getDay()

  const labeledData = useMemo(() => {
    return data.map((value, index) => ({
      day: days[(today - 6 + index + 7) % 7],
      value,
      isToday: index === data.length - 1,
    }))
  }, [data, today])

  const maxValue = Math.max(...data, goal)

  return (
    <div className={`rounded-2xl p-4 ${dark ? 'bg-white/5' : 'bg-white/20'}`} style={{ backdropFilter: 'blur(20px)' }}>
      <div className="flex items-end justify-between gap-2 h-32">
        {labeledData.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const isGoalMet = item.value >= goal

          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full h-24 flex items-end justify-center">
                <div
                  className={`w-full max-w-8 rounded-t-lg transition-all duration-300 ${
                    item.isToday
                      ? isGoalMet
                        ? 'bg-[#4caf50]'
                        : dark ? 'bg-[#4fc3f7]' : 'bg-[#0288d1]'
                      : dark ? 'bg-white/30' : 'bg-white/50'
                  }`}
                  style={{ height: `${height}%` }}
                />
                {item.isToday && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <span className={`text-xs ${dark ? 'text-white/60' : 'text-white/80'}`}>
                      {item.value}/{goal}
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-xs ${item.isToday ? (dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]') : (dark ? 'text-white/40' : 'text-white/60')}`}>
                {item.day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
