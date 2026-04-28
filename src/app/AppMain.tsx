import '../i18n'
import { useLayout } from '../hooks'
import { MobilePortraitLayout, MobileLandscapeLayout, DesktopSplitLayout } from '../layouts'

/**
 * Main app entry point for web/desktop/mobile platforms
 * Automatically selects layout based on screen dimensions
 */
export default function AppMain() {
  const layout = useLayout()

  switch (layout) {
    case 'mobile-portrait':
      return <MobilePortraitLayout />
    case 'mobile-landscape':
      return <MobileLandscapeLayout />
    case 'desktop-split':
      return <DesktopSplitLayout />
  }
}
