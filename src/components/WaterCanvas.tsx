import { useEffect, useRef } from 'react'

interface Props {
  level: number
  dark: boolean
  mode?: 'fullscreen' | 'card'
  bubbles?: boolean
  highlight?: boolean
  waveAmplitude?: number
}

/**
 * Shared water canvas component for all platforms
 * - fullscreen mode: covers entire viewport
 * - card mode: adapts to container size with rounded corners
 */
export function WaterCanvas({
  level,
  dark,
  mode = 'fullscreen',
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

    // Get CSS variable colors
    const style = getComputedStyle(document.documentElement)
    const waterSurface = style.getPropertyValue('--water-surface').trim() || 'rgba(77, 166, 255, 0.5)'
    const waterBody = style.getPropertyValue('--water-body').trim() || 'rgba(0, 102, 204, 0.6)'
    const waterDeep = style.getPropertyValue('--water-deep').trim() || 'rgba(0, 61, 122, 0.7)'

    const resize = () => {
      if (mode === 'fullscreen') {
        canvas.width = window.innerWidth * 2
        canvas.height = window.innerHeight * 2
        canvas.style.width = `${window.innerWidth}px`
        canvas.style.height = `${window.innerHeight}px`
      } else {
        const container = canvas.parentElement
        if (container) {
          const rect = container.getBoundingClientRect()
          canvas.width = rect.width * 2
          canvas.height = rect.height * 2
          canvas.style.width = `${rect.width}px`
          canvas.style.height = `${rect.height}px`
        }
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const t = frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Card mode: draw glass background
      if (mode === 'card') {
        ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.35)'
        ctx.beginPath()
        ctx.roundRect(0, 0, w, h, 32)
        ctx.fill()
        ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Smooth level transition
      const diff = targetLevelRef.current - currentLevelRef.current
      currentLevelRef.current += diff * 0.03

      const displayLevel = currentLevelRef.current
      const waterH = h * displayLevel / 100
      const surfaceY = h - waterH

      if (displayLevel > 0.1) {
        // Clip to rounded rect for card mode
        if (mode === 'card') {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(0, 0, w, h, 32)
          ctx.clip()
        }

        // Water gradient using CSS variables
        const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
        grad.addColorStop(0, waterSurface)
        grad.addColorStop(0.5, waterBody)
        grad.addColorStop(1, waterDeep)

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
            if (x === 0) {
              ctx.moveTo(x, y - 20)
            } else {
              ctx.lineTo(x, y + 40)
            }
          }
          ctx.lineTo(w, surfaceY - 20)
          ctx.fillStyle = hl
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Bubbles
        if (bubbles) {
          const bubbleCount = mode === 'card' ? 6 : 8
          for (let i = 0; i < bubbleCount; i++) {
            const bx = w * (0.1 + i * (0.8 / bubbleCount)) + Math.sin(t * 0.02 + i * 2) * 10
            const by = surfaceY + waterH * (0.2 + (i % 4) * 0.2) + Math.sin(t * 0.03 + i) * 5
            const br = 3 + Math.sin(t * 0.04 + i) * 2
            ctx.beginPath()
            ctx.arc(bx, by, br, 0, Math.PI * 2)
            ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'
            ctx.fill()
          }
        }

        if (mode === 'card') {
          ctx.restore()
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark, bubbles, highlight, waveAmplitude, mode])

  return (
    <canvas
      ref={canvasRef}
      className={mode === 'fullscreen' ? 'fixed inset-0 pointer-events-none' : 'w-full h-full rounded-[32px]'}
    />
  )
}
