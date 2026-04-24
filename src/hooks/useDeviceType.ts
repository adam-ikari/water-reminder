import { useState, useEffect } from 'react'

export type DeviceType = 'watch' | 'mobile' | 'foldable' | 'tablet' | 'desktop'

export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  isLandscape: boolean
  isFoldable: boolean
  hasNotch: boolean
  pixelRatio: number
}

const BREAKPOINTS = {
  watch: 280,
  mobile: 768,
  foldable: 1024,
  tablet: 1280,
} as const

function detectDeviceType(width: number, height: number): DeviceType {
  const minDimension = Math.min(width, height)
  const maxDimension = Math.max(width, height)

  // Watch: very small screens (typically circular or square)
  if (minDimension < BREAKPOINTS.watch) {
    return 'watch'
  }

  // Mobile: phones in portrait
  if (maxDimension < BREAKPOINTS.mobile) {
    return 'mobile'
  }

  // Foldable: devices that can span between mobile and tablet
  // Detect by aspect ratio and width range
  if (maxDimension >= BREAKPOINTS.mobile && maxDimension < BREAKPOINTS.foldable) {
    const aspectRatio = maxDimension / minDimension
    // Foldables often have unusual aspect ratios when unfolded
    if (aspectRatio < 1.5 || (width >= BREAKPOINTS.mobile && height >= BREAKPOINTS.mobile)) {
      return 'foldable'
    }
    return 'mobile'
  }

  // Tablet: medium screens
  if (maxDimension >= BREAKPOINTS.foldable && maxDimension < BREAKPOINTS.tablet) {
    return 'tablet'
  }

  // Desktop: large screens
  return 'desktop'
}

function detectFoldable(width: number, height: number): boolean {
  // Foldable devices often have:
  // - Width in tablet range but height in mobile range (unfolded)
  // - Or both dimensions in the transition zone
  const minDim = Math.min(width, height)
  const maxDim = Math.max(width, height)

  return (
    (minDim >= 600 && minDim < BREAKPOINTS.foldable) ||
    (maxDim >= BREAKPOINTS.mobile && maxDim < BREAKPOINTS.foldable && minDim >= BREAKPOINTS.mobile)
  )
}

function detectNotch(): boolean {
  // Check for notch/Dynamic Island via safe area insets
  if (typeof window === 'undefined') return false

  const safeAreaTop = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--sat') ||
    getComputedStyle(document.documentElement).getPropertyValue('padding-top') ||
    '0'
  )

  return safeAreaTop > 20
}

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        width: 1280,
        height: 800,
        isLandscape: true,
        isFoldable: false,
        hasNotch: false,
        pixelRatio: 1,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight

    return {
      type: detectDeviceType(width, height),
      width,
      height,
      isLandscape: width > height,
      isFoldable: detectFoldable(width, height),
      hasNotch: detectNotch(),
      pixelRatio: window.devicePixelRatio,
    }
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setDeviceInfo({
        type: detectDeviceType(width, height),
        width,
        height,
        isLandscape: width > height,
        isFoldable: detectFoldable(width, height),
        hasNotch: detectNotch(),
        pixelRatio: window.devicePixelRatio,
      })
    }

    // Listen for resize
    window.addEventListener('resize', updateDeviceInfo)

    // Listen for orientation change (important for foldables)
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(updateDeviceInfo, 100)
    })

    // Listen for visual viewport changes (keyboard, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDeviceInfo)
    }

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDeviceInfo)
      }
    }
  }, [])

  return deviceInfo
}

// Utility hooks for specific device checks
export function useIsWatch(): boolean {
  const { type } = useDeviceType()
  return type === 'watch'
}

export function useIsMobile(): boolean {
  const { type } = useDeviceType()
  return type === 'mobile'
}

export function useIsFoldable(): boolean {
  const { type, isFoldable } = useDeviceType()
  return type === 'foldable' || isFoldable
}

export function useIsTablet(): boolean {
  const { type } = useDeviceType()
  return type === 'tablet'
}

export function useIsDesktop(): boolean {
  const { type } = useDeviceType()
  return type === 'desktop'
}