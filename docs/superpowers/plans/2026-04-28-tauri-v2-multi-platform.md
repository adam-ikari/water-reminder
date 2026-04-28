# Tauri v2 Multi-Platform Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tauri v2 support to enable desktop, mobile, tablet, Android Watch, and Web/PWA from a single codebase.

**Architecture:** Platform abstraction layer with shared data logic, two UI targets (main UI for phone/tablet/desktop/web, watch UI for Android Watch), environment variable controlled builds.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS + Vite 8 + Tauri v2 + Rust

---

## File Structure

### New Files to Create

```
src/
├── main.tsx                    # Root entry with BUILD_TARGET routing
├── app/
│   └── AppMain.tsx             # Main UI entry (refactored from App.tsx)
├── watch/
│   ├── WatchApp.tsx            # Watch UI entry
│   └── components/
│       ├── WatchWater.tsx      # Watch water canvas
│       └── WatchButtons.tsx    # Watch action buttons
├── shared/
│   ├── hooks/
│   │   ├── useWaterData.ts     # Water data state management
│   │   ├── useStorage.ts       # Storage abstraction
│   │   └── useNotification.ts  # Notification abstraction
│   ├── types.ts                # Shared type definitions
│   └── constants.ts            # App constants
├── platforms/
│   ├── index.ts                # Platform detection and API export
│   ├── types.ts                # Platform API interface
│   ├── web.ts                  # Web/PWA implementation
│   └── tauri.ts                # Tauri implementation

src-tauri/
├── src/
│   ├── main.rs                 # Tauri main entry
│   ├── lib.rs                  # Library exports
│   └── commands/
│       ├── mod.rs              # Commands module
│       ├── storage.rs          # Storage commands
│       └── notification.rs     # Notification commands
├── capabilities/
│   └── default.json            # Tauri v2 permissions
├── tauri.conf.json             # Main build config
├── tauri.watch.conf.json       # Watch build config
├── Cargo.toml                  # Rust dependencies
├── build.rs                    # Build script
└── icons/                      # App icons

public/
├── manifest.json               # PWA manifest
└── sw.js                       # Service Worker

.env                            # Environment variables
```

### Files to Modify

```
package.json                    # Add Tauri scripts and dependencies
vite.config.ts                  # Add BUILD_TARGET handling
tsconfig.json                   # Add path aliases
.gitignore                      # Add Tauri build outputs
```

---

## Phase 1: Foundation Setup

### Task 1: Install Tauri v2 CLI

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Tauri v2 CLI and API packages**

```bash
pnpm add -D @tauri-apps/cli@^2
pnpm add @tauri-apps/api@^2 @tauri-apps/plugin-notification @tauri-apps/plugin-store
```

- [ ] **Step 2: Verify installation**

Run: `pnpm tauri --version`
Expected: `tauri-cli 2.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add Tauri v2 CLI and API dependencies"
```

---

### Task 2: Create Environment Variable Configuration

**Files:**
- Create: `.env`
- Modify: `vite.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Create .env file**

```bash
# Build target: main (default) or watch
BUILD_TARGET=main
```

- [ ] **Step 2: Update vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  const target = process.env.BUILD_TARGET || 'main'

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __BUILD_TARGET__: JSON.stringify(target),
    },
    build: {
      outDir: target === 'watch' ? 'dist-watch' : 'dist',
    },
  }
})
```

- [ ] **Step 3: Update .gitignore**

Add to `.gitignore`:
```
# Tauri build outputs
dist-watch/
src-tauri/target/

# Environment files
.env.local
```

- [ ] **Step 4: Add TypeScript declaration for BUILD_TARGET**

Create `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

declare const __BUILD_TARGET__: string
```

- [ ] **Step 5: Commit**

```bash
git add .env vite.config.ts .gitignore src/vite-env.d.ts
git commit -m "chore: add BUILD_TARGET environment variable support"
```

---

### Task 3: Initialize Tauri Project Structure

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/capabilities/default.json`
- Create: `src-tauri/build.rs`

- [ ] **Step 1: Create src-tauri directory structure**

```bash
mkdir -p src-tauri/src/commands src-tauri/capabilities src-tauri/icons
```

- [ ] **Step 2: Create Cargo.toml**

```toml
[package]
name = "water-reminder"
version = "0.1.0"
description = "Water Reminder App"
authors = ["you"]
edition = "2021"

[lib]
name = "water_reminder_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-notification = "2"
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- [ ] **Step 3: Create src-tauri/tauri.conf.json**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Water Reminder",
  "version": "0.1.0",
  "identifier": "com.waterreminder.app",
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Water Reminder",
        "width": 400,
        "height": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "plugins": {
    "notification": {
      "permission": "granted"
    }
  }
}
```

- [ ] **Step 4: Create src-tauri/capabilities/default.json**

```json
{
  "$schema": "https://schema.tauri.app/config/2/capability",
  "identifier": "default",
  "description": "Default capabilities for the app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "notification:default",
    "store:default"
  ]
}
```

- [ ] **Step 5: Create src-tauri/build.rs**

```rust
fn main() {
    tauri_build::build();
}
```

- [ ] **Step 6: Create src-tauri/src/main.rs**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    water_reminder_lib::run()
}
```

- [ ] **Step 7: Create src-tauri/src/lib.rs**

```rust
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::storage::get_data,
            commands::storage::set_data,
            commands::notification::schedule_reminder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 8: Create src-tauri/src/commands/mod.rs**

```rust
pub mod storage;
pub mod notification;
```

- [ ] **Step 9: Create src-tauri/src/commands/storage.rs**

```rust
use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct WaterData {
    pub count: u32,
    pub goal: u32,
    pub history: Vec<DrinkRecord>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DrinkRecord {
    pub id: String,
    pub timestamp: String,
    pub amount: u32,
}

#[tauri::command]
pub async fn get_data(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let store = app.store("water.json").map_err(|e| e.to_string())?;
    let data = store.get("data").map(|v| v.as_str().unwrap_or("").to_string());
    Ok(data)
}

#[tauri::command]
pub async fn set_data(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let mut store = app.store("water.json").map_err(|e| e.to_string())?;
    store.set("data", data);
    store.save().map_err(|e| e.to_string())
}
```

- [ ] **Step 10: Create src-tauri/src/commands/notification.rs**

```rust
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
pub async fn schedule_reminder(
    app: tauri::AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}
```

- [ ] **Step 11: Commit**

```bash
git add src-tauri/
git commit -m "feat: initialize Tauri v2 project structure"
```

---

### Task 4: Create Platform Abstraction Layer

**Files:**
- Create: `src/platforms/types.ts`
- Create: `src/platforms/web.ts`
- Create: `src/platforms/tauri.ts`
- Create: `src/platforms/index.ts`

- [ ] **Step 1: Create src/platforms/types.ts**

```typescript
export interface NotificationOptions {
  title: string
  body: string
  id?: string
  scheduledAt?: Date
}

export interface DeviceInfo {
  type: 'phone' | 'tablet' | 'watch' | 'desktop' | 'browser'
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web'
}

export interface PlatformAPI {
  storage: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
  }
  notification: {
    requestPermission: () => Promise<boolean>
    schedule: (options: NotificationOptions) => Promise<void>
    cancel: (id: string) => Promise<void>
  }
  device: DeviceInfo
}
```

- [ ] **Step 2: Create src/platforms/web.ts**

```typescript
import type { PlatformAPI, NotificationOptions, DeviceInfo } from './types'

const deviceInfo: DeviceInfo = {
  type: 'browser',
  platform: 'web',
}

export const webPlatform: PlatformAPI = {
  storage: {
    get: async (key: string) => localStorage.getItem(key),
    set: async (key: string, value: string) => localStorage.setItem(key, value),
  },

  notification: {
    requestPermission: async () => {
      if (!('Notification' in window)) return false
      const result = await Notification.requestPermission()
      return result === 'granted'
    },

    schedule: async (options: NotificationOptions) => {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      if (options.scheduledAt) {
        const delay = options.scheduledAt.getTime() - Date.now()
        if (delay > 0) {
          setTimeout(() => {
            new Notification(options.title, { body: options.body })
          }, delay)
        }
      } else {
        new Notification(options.title, { body: options.body })
      }
    },

    cancel: async () => {
      // Web notifications can't be cancelled once shown
    },
  },

  device: deviceInfo,
}
```

- [ ] **Step 3: Create src/platforms/tauri.ts**

```typescript
import type { PlatformAPI, NotificationOptions, DeviceInfo } from './types'

let deviceInfo: DeviceInfo = {
  type: 'phone',
  platform: 'android',
}

export const tauriPlatform: PlatformAPI = {
  storage: {
    get: async (key: string) => {
      const { get_data } = await import('@tauri-apps/api/core')
      try {
        const result = await get_data<string>({ key })
        return result ?? null
      } catch {
        return null
      }
    },

    set: async (key: string, value: string) => {
      const { set_data } = await import('@tauri-apps/api/core')
      await set_data({ key, value })
    },
  },

  notification: {
    requestPermission: async () => {
      const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification')
      if (await isPermissionGranted()) return true
      const permission = await requestPermission()
      return permission === 'granted'
    },

    schedule: async (options: NotificationOptions) => {
      const { sendNotification } = await import('@tauri-apps/plugin-notification')
      await sendNotification({
        title: options.title,
        body: options.body,
      })
    },

    cancel: async (id: string) => {
      const { cancel } = await import('@tauri-apps/plugin-notification')
      await cancel(id)
    },
  },

  device: deviceInfo,
}

export async function initDeviceInfo() {
  try {
    const { platform } = await import('@tauri-apps/plugin-os')
    const os = await platform()

    const { innerWidth, innerHeight } = window
    const minDim = Math.min(innerWidth, innerHeight)

    let type: DeviceInfo['type'] = 'phone'
    if (minDim < 200) type = 'watch'
    else if (minDim < 600) type = 'phone'
    else if (innerWidth > innerHeight * 1.5) type = 'tablet'
    else type = 'desktop'

    deviceInfo = { type, platform: os as DeviceInfo['platform'] }
  } catch {
    // Fallback to defaults
  }
}
```

- [ ] **Step 4: Create src/platforms/index.ts**

```typescript
import type { PlatformAPI } from './types'
import { webPlatform } from './web'
import { tauriPlatform, initDeviceInfo } from './tauri'

let platform: PlatformAPI

export async function getPlatform(): Promise<PlatformAPI> {
  if (platform) return platform

  if (window.__TAURI__) {
    await initDeviceInfo()
    platform = tauriPlatform
  } else {
    platform = webPlatform
  }

  return platform
}

export type { PlatformAPI, NotificationOptions, DeviceInfo } from './types'
```

- [ ] **Step 5: Commit**

```bash
git add src/platforms/
git commit -m "feat: add platform abstraction layer for Web and Tauri"
```

---

## Phase 2: Shared Logic Extraction

### Task 5: Create Shared Types and Constants

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/shared/constants.ts`

- [ ] **Step 1: Create src/shared/types.ts**

```typescript
export interface DrinkRecord {
  id: string
  timestamp: Date
  amount: number
}

export interface WaterState {
  count: number
  goal: number
  history: DrinkRecord[]
  dark: boolean
  language: 'zh' | 'en'
}

export type DeviceType = 'phone' | 'tablet' | 'watch' | 'desktop' | 'browser'
```

- [ ] **Step 2: Create src/shared/constants.ts**

```typescript
export const DEFAULT_GOAL = 8
export const STORAGE_KEY = 'water'
export const DARK_KEY = 'dark'
export const LANG_KEY = 'lang'
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/
git commit -m "feat: add shared types and constants"
```

---

### Task 6: Create Shared Hooks

**Files:**
- Create: `src/shared/hooks/useStorage.ts`
- Create: `src/shared/hooks/useWaterData.ts`
- Create: `src/shared/hooks/useNotification.ts`

- [ ] **Step 1: Create src/shared/hooks/useStorage.ts**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { getPlatform } from '../../platforms'

export function useStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getPlatform().then(platform => {
      platform.storage.get(key).then(stored => {
        if (stored) {
          try {
            setValue(JSON.parse(stored))
          } catch {
            setValue(stored as unknown as T)
          }
        }
        setLoaded(true)
      })
    })
  }, [key])

  const setAndSave = useCallback(async (newValue: T) => {
    setValue(newValue)
    const platform = await getPlatform()
    await platform.storage.set(key, JSON.stringify(newValue))
  }, [key])

  return [value, setAndSave, loaded] as const
}
```

- [ ] **Step 2: Create src/shared/hooks/useWaterData.ts**

```typescript
import { useCallback } from 'react'
import { useStorage } from './useStorage'
import type { DrinkRecord, WaterState } from '../types'
import { DEFAULT_GOAL, STORAGE_KEY } from '../constants'

const initialState: WaterState = {
  count: 0,
  goal: DEFAULT_GOAL,
  history: [],
  dark: false,
  language: 'zh',
}

export function useWaterData() {
  const [state, setState, loaded] = useStorage<WaterState>(STORAGE_KEY, initialState)

  const add = useCallback(() => {
    if (state.count >= state.goal) return
    const newRecord: DrinkRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      amount: 1,
    }
    setState({
      ...state,
      count: state.count + 1,
      history: [...state.history, newRecord],
    })
  }, [state, setState])

  const remove = useCallback((id: string) => {
    const record = state.history.find(r => r.id === id)
    if (!record) return
    setState({
      ...state,
      count: Math.max(0, state.count - record.amount),
      history: state.history.filter(r => r.id !== id),
    })
  }, [state, setState])

  const setGoal = useCallback((goal: number) => {
    setState({ ...state, goal })
  }, [state, setState])

  const setDark = useCallback((dark: boolean) => {
    setState({ ...state, dark })
  }, [state, setState])

  const setLanguage = useCallback((language: 'zh' | 'en') => {
    setState({ ...state, language })
  }, [state, setState])

  const todayHistory = state.history
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reverse()

  const level = (state.count / state.goal) * 100

  return {
    count: state.count,
    goal: state.goal,
    history: todayHistory,
    dark: state.dark,
    language: state.language,
    level,
    loaded,
    add,
    remove,
    setGoal,
    setDark,
    setLanguage,
  }
}
```

- [ ] **Step 3: Create src/shared/hooks/useNotification.ts**

```typescript
import { useCallback, useEffect } from 'react'
import { getPlatform } from '../../platforms'

export function useNotification() {
  const requestPermission = useCallback(async () => {
    const platform = await getPlatform()
    return platform.notification.requestPermission()
  }, [])

  const scheduleReminder = useCallback(async (title: string, body: string, delayMinutes: number) => {
    const platform = await getPlatform()
    const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000)
    await platform.notification.schedule({ title, body, scheduledAt })
  }, [])

  useEffect(() => {
    // Request permission on mount
    requestPermission()
  }, [requestPermission])

  return { requestPermission, scheduleReminder }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/hooks/
git commit -m "feat: add shared hooks for storage, water data, and notifications"
```

---

### Task 7: Refactor Existing App to Use Shared Hooks

**Files:**
- Create: `src/app/AppMain.tsx`
- Create: `src/main.tsx`
- Modify: `src/App.tsx` (move to `src/app/AppMain.tsx`)

- [ ] **Step 1: Create src/main.tsx (root entry)**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'

// @ts-ignore - injected by Vite
declare const __BUILD_TARGET__: string

async function bootstrap() {
  const root = document.getElementById('root')!
  const { createRoot } = await import('react-dom/client')

  if (__BUILD_TARGET__ === 'watch') {
    const { default: WatchApp } = await import('./watch/WatchApp')
    createRoot(root).render(<StrictMode><WatchApp /></StrictMode>)
  } else {
    const { default: AppMain } = await import('./app/AppMain')
    createRoot(root).render(<StrictMode><AppMain /></StrictMode>)
  }
}

bootstrap()
```

- [ ] **Step 2: Create src/app/AppMain.tsx (refactored from App.tsx)**

Move the existing `App.tsx` content to `src/app/AppMain.tsx`, updating imports to use shared hooks:

```typescript
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWaterData } from '../shared/hooks/useWaterData'
import '../i18n'

// FullscreenWater component (keep existing)
function FullscreenWater({ level, dark }: { level: number; dark: boolean }) {
  // ... existing code ...
}

// CardWater component (keep existing)
function CardWater({ level, dark }: { level: number; dark: boolean }) {
  // ... existing code ...
}

export default function AppMain() {
  const { t, i18n } = useTranslation()
  const {
    count,
    goal,
    history,
    dark,
    language,
    level,
    loaded,
    add,
    remove,
    setDark,
    setLanguage,
  } = useWaterData()

  const [settings, setSettings] = useState(false)
  const [historyView, setHistoryView] = useState(false)
  const [isWide, setIsWide] = useState(() => window.innerWidth > 600)

  // ... rest of existing App.tsx code ...
}
```

- [ ] **Step 3: Update src/index.css import path in main.tsx**

The `index.css` import should be in `main.tsx`, not `AppMain.tsx`.

- [ ] **Step 4: Delete old src/App.tsx**

```bash
rm src/App.tsx
```

- [ ] **Step 5: Update index.html entry point**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Water Reminder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Test Web build**

Run: `pnpm dev`
Expected: App loads normally with same functionality

- [ ] **Step 7: Commit**

```bash
git add src/main.tsx src/app/ src/index.html
git rm src/App.tsx
git commit -m "refactor: move App to app/AppMain.tsx and add BUILD_TARGET routing"
```

---

## Phase 3: PWA Support

### Task 8: Add PWA Manifest and Service Worker

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `index.html`

- [ ] **Step 1: Create public/manifest.json**

```json
{
  "name": "Water Reminder",
  "short_name": "Water",
  "description": "Daily water intake tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f0f4f8",
  "theme_color": "#0066ff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Create public/sw.js**

```javascript
const CACHE_NAME = 'water-reminder-v1'
const urlsToCache = [
  '/',
  '/index.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
```

- [ ] **Step 3: Update index.html for PWA**

Add to `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0066ff" />
```

- [ ] **Step 4: Register service worker in main.tsx**

Add to `src/main.tsx` after imports:
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/sw.js index.html src/main.tsx
git commit -m "feat: add PWA manifest and service worker"
```

---

## Phase 4: Watch UI

### Task 9: Create Watch App Entry

**Files:**
- Create: `src/watch/WatchApp.tsx`
- Create: `src/watch/components/WatchWater.tsx`
- Create: `src/watch/components/WatchButtons.tsx`

- [ ] **Step 1: Create src/watch/WatchApp.tsx**

```typescript
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWaterData } from '../shared/hooks/useWaterData'
import { WatchWater } from './components/WatchWater'
import { WatchButtons } from './components/WatchButtons'

export default function WatchApp() {
  const { count, goal, level, dark, add, setDark } = useWaterData()
  const [view, setView] = useState<'main' | 'history'>('main')

  // Detect round vs square screen
  const [isRound, setIsRound] = useState(false)
  useEffect(() => {
    const check = () => {
      const minDim = Math.min(window.innerWidth, window.innerHeight)
      setIsRound(minDim < 220)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        dark ? 'bg-[#0d1b2a]' : 'bg-[#f0f4f8]'
      }`}
      style={{
        borderRadius: isRound ? '50%' : '16px',
        overflow: 'hidden',
      }}
    >
      <WatchWater level={level} dark={dark} />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          key={count}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`flex items-baseline gap-1 ${dark ? 'text-white' : 'text-[#1a365d]'}`}>
            <span className="text-5xl font-extralight">{count}</span>
            <span className="text-lg opacity-50">/{goal}</span>
          </div>
        </motion.div>

        {count < goal && <WatchButtons onAdd={add} dark={dark} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/watch/components/WatchWater.tsx**

```typescript
import { useEffect, useRef } from 'react'

interface Props {
  level: number
  dark: boolean
}

export function WatchWater({ level, dark }: Props) {
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

      const diff = targetLevelRef.current - currentLevelRef.current
      currentLevelRef.current += diff * 0.03
      const displayLevel = currentLevelRef.current
      const waterH = h * displayLevel / 100
      const surfaceY = h - waterH

      if (displayLevel > 0.1) {
        const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
        grad.addColorStop(0, dark ? '#4fc3f7' : '#81d4fa')
        grad.addColorStop(0.5, dark ? '#29b6f6' : '#4fc3f7')
        grad.addColorStop(1, dark ? '#0288d1' : '#29b6f6')

        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const y = surfaceY + Math.sin(x * 0.008 + t * 0.025) * 6 + Math.sin(x * 0.012 + t * 0.035) * 4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.fillStyle = grad
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />
}
```

- [ ] **Step 3: Create src/watch/components/WatchButtons.tsx**

```typescript
import { motion } from 'framer-motion'

interface Props {
  onAdd: () => void
  dark: boolean
}

export function WatchButtons({ onAdd, dark }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onAdd}
      className={`w-16 h-16 rounded-full flex items-center justify-center mt-6 ${
        dark
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/30 border border-white/50'
      }`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: dark
          ? '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}
    >
      <svg
        className={`w-8 h-8 ${dark ? 'text-[#4fc3f7]' : 'text-[#0288d1]'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  )
}
```

- [ ] **Step 4: Test Watch build**

Run: `BUILD_TARGET=watch pnpm dev`
Expected: Watch UI renders with water animation

- [ ] **Step 5: Commit**

```bash
git add src/watch/
git commit -m "feat: add Watch UI with round/square screen support"
```

---

## Phase 5: Build Configuration

### Task 10: Update Package Scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add Tauri scripts to package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "dev:watch": "BUILD_TARGET=watch vite",
    "build": "vite build",
    "build:watch": "BUILD_TARGET=watch vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:dev:watch": "BUILD_TARGET=watch tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:watch": "BUILD_TARGET=watch tauri build",
    "tauri:build:android": "tauri android build",
    "tauri:build:android:watch": "BUILD_TARGET=watch tauri android build"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add Tauri build scripts for all platforms"
```

---

### Task 11: Create Watch Tauri Config

**Files:**
- Create: `src-tauri/tauri.watch.conf.json`

- [ ] **Step 1: Create src-tauri/tauri.watch.conf.json**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Water Reminder Watch",
  "version": "0.1.0",
  "identifier": "com.waterreminder.watch",
  "build": {
    "beforeBuildCommand": "BUILD_TARGET=watch pnpm build",
    "beforeDevCommand": "BUILD_TARGET=watch pnpm dev",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist-watch"
  },
  "app": {
    "windows": [
      {
        "title": "Water Reminder Watch",
        "width": 368,
        "height": 448,
        "resizable": false,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "plugins": {
    "notification": {
      "permission": "granted"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/tauri.watch.conf.json
git commit -m "feat: add Watch-specific Tauri configuration"
```

---

## Phase 6: Verification

### Task 12: Verify All Builds

- [ ] **Step 1: Test Web build**

Run: `pnpm build && pnpm preview`
Expected: Web app works with PWA features

- [ ] **Step 2: Test Watch build**

Run: `pnpm build:watch && pnpm preview`
Expected: Watch UI renders correctly

- [ ] **Step 3: Test Tauri dev (requires Rust)**

Run: `pnpm tauri:dev`
Expected: Desktop app launches

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Tauri v2 multi-platform support"
```

---

## Summary

| Phase | Tasks | Key Deliverables |
|-------|-------|------------------|
| 1 | 1-4 | Tauri CLI, env vars, project structure, platform layer |
| 2 | 5-7 | Shared types, hooks, refactored App |
| 3 | 8 | PWA manifest and service worker |
| 4 | 9 | Watch UI with round/square support |
| 5 | 10-11 | Build scripts and watch config |
| 6 | 12 | Verification of all builds |
