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

// __BUILD_TARGET__ is injected by Vite at build time
declare const __BUILD_TARGET__: string

async function bootstrap() {
  const root = document.getElementById('root')!

  if (__BUILD_TARGET__ === 'watch') {
    const { default: WatchApp } = await import('./watch/WatchApp')
    createRoot(root).render(<StrictMode><WatchApp /></StrictMode>)
  } else {
    const { default: AppMain } = await import('./app/AppMain')
    createRoot(root).render(<StrictMode><AppMain /></StrictMode>)
  }
}

bootstrap()
