import '../i18n'
import { useLayout } from '../hooks'
import { MobilePortraitLayout, MobileLandscapeLayout, DesktopSplitLayout, WatchLayout } from '../layouts'

/**
 * Main app entry point for all platforms
 * Automatically selects layout based on screen dimensions
 * Tree-shaking removes unused layouts at build time
 */
export default function AppMain() {
  const layout = useLayout()

  switch (layout) {
    case 'watch':
      return <WatchLayout />
    case 'mobile-portrait':
      return <MobilePortraitLayout />
    case 'mobile-landscape':
      return <MobileLandscapeLayout />
    case 'desktop-split':
      return <DesktopSplitLayout />
  }
}
