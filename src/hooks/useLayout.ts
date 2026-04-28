import { useState, useEffect } from 'react'

export type LayoutType = 'mobile-portrait' | 'mobile-landscape' | 'desktop-split'

export function useLayout(): LayoutType {
  const [layout, setLayout] = useState<LayoutType>(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    if (width >= 600 && height >= 500) return 'desktop-split'
    if (width >= 600 && height < 500) return 'mobile-landscape'
    return 'mobile-portrait'
  })

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      if (width >= 600 && height >= 500) {
        setLayout('desktop-split')
      } else if (width >= 600 && height < 500) {
        setLayout('mobile-landscape')
      } else {
        setLayout('mobile-portrait')
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return layout
}
