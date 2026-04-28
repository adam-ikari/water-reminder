import { useEffect, useRef } from 'react'

interface Props {
  level: number
  dark: boolean
  /** Show bubbles animation */
  bubbles?: boolean
  /** Show surface highlight */
  highlight?: boolean
  /** Wave amplitude multiplier */
  waveAmplitude?: number
}

/**
 * Shared water canvas component for all platforms
 * Used by: Mobile fullscreen, Desktop card, Watch
 */
export function WaterCanvas({
  level,
  dark,
  bubbles = true,
  highlight = true,
  waveAmplitude = 1
}: Props) {
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

      // Smooth level transition
      const diff = targetLevelRef.current - currentLevelRef.current
      currentLevelRef.current += diff * 0.03

      const displayLevel = currentLevelRef.current
      const waterH = h * displayLevel / 100
      const surfaceY = h - waterH

      if (displayLevel > 0.1) {
        // Water gradient
        const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
        grad.addColorStop(0, dark ? '#4fc3f7' : '#81d4fa')
        grad.addColorStop(0.5, dark ? '#29b6f6' : '#4fc3f7')
        grad.addColorStop(1, dark ? '#0288d1' : '#29b6f6')

        // Wave surface
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const baseWave = Math.sin(x * 0.005 + t * 0.02) * 8 * waveAmplitude
          const secondWave = Math.sin(x * 0.008 + t * 0.03) * 5 * waveAmplitude
          const y = surfaceY + baseWave + secondWave
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.fillStyle = grad
        ctx.fill()

        // Surface highlight
        if (highlight) {
          ctx.globalAlpha = 0.3
          const hl = ctx.createLinearGradient(0, surfaceY - 20, 0, surfaceY + 40)
          hl.addColorStop(0, 'transparent')
          hl.addColorStop(0.5, dark ? '#b3e5fc' : '#e1f5fe')
          hl.addColorStop(1, 'transparent')
          ctx.beginPath()
          for (let x = 0; x <= w; x += 4) {
            const y = surfaceY + Math.sin(x * 0.005 + t * 0.02) * 8 * waveAmplitude
            x === 0 ? ctx.moveTo(x, y - 20) : ctx.lineTo(x, y + 40)
          }
          ctx.lineTo(w, surfaceY - 20)
          ctx.fillStyle = hl
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Bubbles
        if (bubbles) {
          for (let i = 0; i < 8; i++) {
            const bx = w * (0.1 + i * 0.1) + Math.sin(t * 0.02 + i * 2) * 10
            const by = surfaceY + waterH * (0.2 + (i % 4) * 0.2) + Math.sin(t * 0.03 + i) * 5
            const br = 3 + Math.sin(t * 0.04 + i) * 2
            ctx.beginPath()
            ctx.arc(bx, by, br, 0, Math.PI * 2)
            ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'
            ctx.fill()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark, bubbles, highlight, waveAmplitude])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />
}
