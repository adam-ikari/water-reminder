import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

/**
 * Single entry point for all platforms
 * Layout is detected at runtime based on screen dimensions
 * Tree-shaking removes unused layouts at build time
 */
async function bootstrap() {
  const root = document.getElementById('root')!
  const { default: AppMain } = await import('./app/AppMain')
  createRoot(root).render(<StrictMode><AppMain /></StrictMode>)
}

bootstrap()
