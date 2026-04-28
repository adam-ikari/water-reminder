import { useEffect, useRef } from 'react'

interface Props {
  level: number
  dark: boolean
}

export function WatchWater({ level, dark }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentLevelRef = useRef(level)
  const targetLevelRef = useRef(level)

  useEffect(() => {
    targetLevelRef.current = level
  }, [level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth * 2
      canvas.height = window.innerHeight * 2
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const t = frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const diff = targetLevelRef.current - currentLevelRef.current
      currentLevelRef.current += diff * 0.03
      const displayLevel = currentLevelRef.current
      const waterH = h * displayLevel / 100
      const surfaceY = h - waterH

      if (displayLevel > 0.1) {
        const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
        grad.addColorStop(0, dark ? '#4fc3f7' : '#81d4fa')
        grad.addColorStop(0.5, dark ? '#29b6f6' : '#4fc3f7')
        grad.addColorStop(1, dark ? '#0288d1' : '#29b6f6')

        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const y = surfaceY + Math.sin(x * 0.008 + t * 0.025) * 6 + Math.sin(x * 0.012 + t * 0.035) * 4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.fillStyle = grad
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />
}
