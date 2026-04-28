# Tauri v2 多平台支持设计文档

## 概述

为 Water Reminder 应用添加 Tauri v2 支持，实现桌面端、移动端、平板和 Android 手表的多平台覆盖，同时保持 Web/PWA 兼容性。

## 目标平台

| 优先级 | 平台 | 状态 |
|--------|------|------|
| P0 | Android 手机/平板 | 首批实现 |
| P0 | Web/PWA | 首批实现 |
| P1 | Android Watch | 首批实现 |
| P2 | 桌面端 (Windows/macOS/Linux) | 后续实现 |
| P3 | iOS (iPhone/iPad/Apple Watch) | 待办 |

## 架构设计

### 目录结构

```
water-reminder/
├── src/                        # React 前端代码
│   ├── app/                    # 主 UI 组（手机/平板/桌面/Web）
│   │   ├── AppMain.tsx         # 主入口
│   │   ├── components/
│   │   └── layouts/
│   │       ├── MobileLayout.tsx
│   │       └── WideLayout.tsx
│   │
│   ├── watch/                  # 手表独立 UI
│   │   ├── WatchApp.tsx
│   │   └── components/
│   │
│   ├── shared/                 # 所有平台共享
│   │   ├── hooks/
│   │   │   ├── useWaterData.ts
│   │   │   ├── useStorage.ts
│   │   │   └── useNotification.ts
│   │   ├── types.ts
│   │   └── constants.ts
│   │
│   ├── platforms/              # 平台 API 适配
│   │   ├── index.ts
│   │   ├── web.ts
│   │   └── tauri.ts
│   │
│   └── main.tsx                # 根入口
│
├── src-tauri/                  # Tauri 后端
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/
│   ├── capabilities/
│   ├── tauri.conf.json         # 通用版配置
│   ├── tauri.watch.conf.json   # 手表版配置
│   ├── Cargo.toml
│   └── build.rs
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker
│
├── .env                        # 环境变量
├── vite.config.ts
└── package.json
```

### 平台适配层

```typescript
// src/platforms/types.ts
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
  device: {
    type: 'phone' | 'tablet' | 'watch' | 'desktop' | 'browser'
    platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web'
  }
}
```

运行时检测 `window.__TAURI__` 存在则使用 Tauri 实现，否则使用 Web 实现。

### UI 策略

| 平台组 | UI 策略 |
|--------|---------|
| 主 UI 组（手机/平板/桌面/Web） | 共用一套 UI，响应式适配 |
| 手表组 | 独立 UI，复用数据逻辑 |

## 构建配置

### 环境变量

```bash
BUILD_TARGET=main    # 通用UI
BUILD_TARGET=watch   # 手表UI
```

### 构建命令

```json
{
  "scripts": {
    "dev": "vite",
    "dev:watch": "BUILD_TARGET=watch vite",
    "build": "vite build",
    "build:watch": "BUILD_TARGET=watch vite build",
    "tauri:dev": "tauri dev",
    "tauri:dev:watch": "BUILD_TARGET=watch tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:watch": "BUILD_TARGET=watch tauri build"
  }
}
```

### 构建产物

| 命令 | 输出 | 目标 |
|------|------|------|
| `pnpm build` | `dist/` | Web/PWA |
| `pnpm tauri:build` | APK/安装包 | 手机/平板/桌面 |
| `pnpm tauri:build:watch` | APK | Android Watch |

## 功能需求

### 数据同步
- 本地优先存储
- 可选云同步（后续实现）

### 通知提醒
- 智能提醒：根据用户习惯和未完成目标动态调整
- 基于 Tauri 通知插件或 Web Notifications API

### 手表功能
- 完整功能：喝水记录、历史、设置
- 圆形/方形屏幕适配
- 大按钮设计（56-64px 触摸区域）

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS + Framer Motion
- **构建**: Vite 8
- **原生**: Tauri v2 + Rust
- **PWA**: Service Worker + Web App Manifest

## 实施阶段

### 阶段 1: 基础架构
1. 安装 Tauri v2 CLI 和依赖
2. 创建 `src-tauri/` 目录结构
3. 配置环境变量和构建脚本
4. 创建平台适配层

### 阶段 2: 通用 UI 迁移
1. 重构现有代码到 `src/app/`
2. 提取共享逻辑到 `src/shared/`
3. 配置 PWA 支持
4. 验证 Web 构建

### 阶段 3: Android 支持
1. 配置 Tauri Android 构建
2. 实现通知功能
3. 测试手机/平板适配

### 阶段 4: 手表 UI
1. 创建 `src/watch/` 独立 UI
2. 配置手表 Tauri 构建
3. 实现圆形/方形屏幕适配

### 阶段 5: 桌面端
1. 配置桌面端构建
2. 添加系统托盘支持
3. 窗口管理优化

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| Tauri Android 支持成熟度 | 先在模拟器验证，再真机测试 |
| 手表 UI 复杂度 | 先完成手机端，复用核心逻辑 |
| iOS 待办 | 保持代码跨平台兼容，预留 iOS 适配接口 |
