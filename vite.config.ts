import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(() => {
  const target = process.env.BUILD_TARGET || 'main'

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __BUILD_TARGET__: JSON.stringify(target),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: target === 'watch' ? 'dist-watch' : 'dist',
    },
  }
})
