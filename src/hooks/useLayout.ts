import { useState, useEffect } from 'react'

export type LayoutType = 'watch' | 'mobile-portrait' | 'mobile-landscape' | 'desktop-split'

export function useLayout(): LayoutType {
  const [layout, setLayout] = useState<LayoutType>(() => detectLayout())

  useEffect(() => {
    const check = () => setLayout(detectLayout())
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return layout
}

function detectLayout(): LayoutType {
  const width = window.innerWidth
  const height = window.innerHeight
  const minDim = Math.min(width, height)

  // Watch: small screen (typically < 220px min dimension)
  if (minDim < 220) return 'watch'

  // Desktop: large screen with both dimensions >= threshold
  if (width >= 600 && height >= 500) return 'desktop-split'

  // Mobile landscape: wide but short
  if (width >= 600 && height < 500) return 'mobile-landscape'

  // Mobile portrait: default
  return 'mobile-portrait'
}
