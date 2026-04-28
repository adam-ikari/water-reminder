# Water Reminder 实现设计

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的多平台应用，支持所有构建目标，通过统一架构和 Vite 摇树优化实现代码复用。

**Architecture:** 统一架构，通过布局组件处理不同交互方式。Web端使用Tab栏导航，手表端使用全屏菜单导航。所有功能页面完全共享，布局由屏幕尺寸决定而非设备类型。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS + Framer Motion + i18next + Tauri v2

---

## 构建目标

| 构建目标 | 平台 | UI入口 | 布局支持 |
|---------|------|--------|---------|
| Android Watch | Android手表 | WatchApp.tsx | 圆形/方形屏幕 |
| Android | Android手机/平板 | AppMain.tsx | 三种布局自适应 |
| iOS/iPadOS | iPhone/iPad | AppMain.tsx | 三种布局自适应 |
| Windows | Windows桌面 | AppMain.tsx | 三种布局自适应 |
| Linux | Linux桌面 | AppMain.tsx | 三种布局自适应 |
| macOS | Mac桌面 | AppMain.tsx | 三种布局自适应 |
| Web-PWA | 浏览器 | AppMain.tsx | 三种布局自适应 |

**所有平台（除手表外）都支持三种布局自适应：**
- mobile-portrait: 窄窗口时
- mobile-landscape: 扁窗口时
- desktop-split: 大窗口时

**构建命令：**
```bash
pnpm build              # Web-PWA
pnpm build:watch        # Android Watch
pnpm tauri:build        # Windows/Linux/macOS
pnpm tauri:build:android # Android
# iOS 通过 Xcode 构建
```

---

## 入口与摇树优化

**两个独立入口，动态导入确保构建时分离：**

```typescript
// main.tsx
declare const __BUILD_TARGET__: string

if (__BUILD_TARGET__ === 'watch') {
  const { default: WatchApp } = await import('./WatchApp')
  createRoot(root).render(<StrictMode><WatchApp /></StrictMode>)
} else {
  const { default: AppMain } = await import('./AppMain')
  createRoot(root).render(<StrictMode><AppMain /></StrictMode>)
}
```

**摇树优化效果：**

| 文件 | Web构建 | 手表构建 |
|------|---------|---------|
| AppMain.tsx | ✅ 包含 | ❌ 排除 |
| WatchApp.tsx | ❌ 排除 | ✅ 包含 |
| components/* | ✅ 按需包含 | ✅ 按需包含 |
| pages/* | ✅ 按需包含 | ✅ 按需包含 |
| layouts/MobilePortrait.tsx | ✅ 包含 | ❌ 排除 |
| layouts/MobileLandscape.tsx | ✅ 包含 | ❌ 排除 |
| layouts/DesktopSplit.tsx | ✅ 包含 | ❌ 排除 |
| layouts/WatchLayout.tsx | ❌ 排除 | ✅ 包含 |

**关键点：**
- 动态 import 确保入口文件不打包到错误目标
- 各入口只导入需要的布局组件
- 共享组件通过实际使用情况摇树
- 手表构建不包含 Web 专用布局代码

---

## 目录结构

```
src/
├── components/           # 共享组件（Web + 手表）
│   ├── WaterCanvas.tsx   # 水位动画（全屏/卡片模式）
│   ├── AddButton.tsx     # 添加按钮（sm/md/lg尺寸）
│   ├── RecordList.tsx    # 日视图记录列表
│   ├── WeekChart.tsx     # 周柱状图
│   ├── MonthCalendar.tsx # 月日历网格
│   ├── ViewSwitch.tsx    # 视图切换按钮（日/周/月）
│   ├── MenuButton.tsx    # 菜单按钮（三点图标）
│   ├── BackButton.tsx    # 返回按钮
│   └── index.ts
├── hooks/                # 共享 hooks
│   ├── useWaterData.ts   # 水量状态（已有，需整合）
│   ├── useSettings.ts    # 深色模式、语言（已有）
│   ├── useLayout.ts      # 布局检测（新增）
│   └── index.ts
├── pages/                # 共享页面（Web + 手表）
│   ├── SettingsPage.tsx  # 设置页面（深色模式、语言、目标）
│   ├── LanguagePage.tsx  # 语言选择（中文/English）
│   ├── GoalPage.tsx      # 目标设置（1-20杯）
│   ├── AboutPage.tsx     # 关于页面（版本、开发者、许可）
│   └── index.ts
├── layouts/              # 布局组件
│   ├── MobilePortrait.tsx   # 移动端竖屏（Tab栏导航）
│   ├── MobileLandscape.tsx  # 移动端横屏（左右分屏）
│   ├── DesktopSplit.tsx     # 桌面/平板分屏（左右分屏）
│   ├── WatchLayout.tsx      # 手表布局（全屏菜单导航）
│   └── index.ts
├── locales/              # 国际化（已有）
├── platforms/            # 平台抽象层（已有）
├── AppMain.tsx           # Web端入口（布局选择）
├── WatchApp.tsx          # 手表端入口
├── main.tsx              # 主入口（已有）
└── index.css             # 样式（已有）
└── store/                # 状态管理（已有，整合到hooks）
```

---

## 布局检测逻辑

**原则：** 布局由屏幕尺寸决定，与设备类型无关。移动端、网页端、桌面端都支持所有布局，窗口调整大小时自动切换。

```typescript
// useLayout.ts
type LayoutType = 'mobile-portrait' | 'mobile-landscape' | 'desktop-split'

function useLayout(): LayoutType {
  const [layout, setLayout] = useState<LayoutType>('mobile-portrait')
  
  useEffect(() => {
    const check = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isWide = width >= 600 && height >= 500
      const isLandscape = width >= 600 && height < 500
      
      if (isWide) {
        setLayout('desktop-split')
      } else if (isLandscape) {
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
```

| 布局 | 触发条件 | 适用场景 |
|------|---------|---------|
| mobile-portrait | width < 600 或 height < 500 | 手机竖屏、浏览器窄窗口 |
| mobile-landscape | width ≥ 600 且 height < 500 | 手机横屏、浏览器扁窗口 |
| desktop-split | width ≥ 600 且 height ≥ 500 | 平板、桌面、浏览器大窗口 |

---

## 交互差异

| 功能 | Web端 | 手表端 |
|------|-------|--------|
| 导航方式 | Tab栏（主页/历史） | 全屏菜单覆盖 |
| 页面切换 | Tab切换 + 全屏滑入 | 全屏覆盖 |
| 视图切换 | 左侧按钮弹出菜单 | 顶部Tab切换 |
| 菜单入口 | 右侧三点按钮 | 右上角三点按钮 |
| 返回按钮 | 底部居中 | 底部居中 |
| 屏幕形状 | 矩形 | 圆形/方形自适应 |

---

## 组件规格

### WaterCanvas

- **Props:** `level: number`, `dark: boolean`, `mode: 'fullscreen' | 'card'`
- **功能:** Canvas绘制水位动画，波浪、气泡、高光效果
- **尺寸:** 全屏模式覆盖整个屏幕，卡片模式适应容器

### AddButton

- **Props:** `onClick: () => void`, `size: 'sm' | 'md' | 'lg'`, `dark: boolean`
- **功能:** 点击添加一杯水，带自发光效果
- **尺寸:** sm=32px, md=56px, lg=64px

### RecordList

- **Props:** `records: DrinkRecord[]`, `onDelete: (id: string) => void`, `dark: boolean`
- **功能:** 显示今日记录列表，支持删除
- **交互:** 左滑显示删除按钮（Web），长按确认删除（手表）

### WeekChart

- **Props:** `data: WeekData[]`, `dark: boolean`
- **功能:** 显示本周柱状图，当天高亮
- **数据:** 7天数据，每日完成量百分比

### MonthCalendar

- **Props:** `month: Date`, `data: MonthData`, `onDateClick: (date: Date) => void`, `dark: boolean`
- **功能:** 日历网格显示，颜色表示完成度
- **交互:** 点击日期查看详情

### ViewSwitch

- **Props:** `mode: 'day' | 'week' | 'month'`, `onChange: (mode) => void`, `dark: boolean`, `expanded: boolean`
- **功能:** 视图切换按钮，展开时显示菜单
- **状态:** 正常显示当前视图名称，展开时变为×关闭

### MenuButton

- **Props:** `onClick: () => void`, `expanded: boolean`, `dark: boolean`
- **功能:** 菜单按钮，展开时变为×关闭
- **样式:** 三点图标，自发光效果

### BackButton

- **Props:** `onClick: () => void`, `dark: boolean`
- **功能:** 返回按钮，底部居中
- **样式:** 左箭头，自发光效果

---

## 页面规格

### SettingsPage

- **内容:** 深色模式开关、语言选择（进入LanguagePage）、每日目标（进入GoalPage）
- **交互:** 全屏页面，返回按钮退出

### LanguagePage

- **内容:** 中文、English选项，当前语言高亮
- **交互:** 二级页面，选择后自动返回

### GoalPage

- **内容:** 数字选择器（1-20杯），当前目标高亮
- **交互:** 二级页面，确认后更新目标

### AboutPage

- **内容:** 应用图标、名称、版本号、开发者信息、开源许可、隐私政策
- **交互:** 全屏页面，返回按钮退出

---

## 布局规格

### MobilePortrait（移动端竖屏）

- **结构:** 全屏WaterCanvas + 内容层 + 底部TabBar
- **TabBar:** 居中，主页/历史两个Tab
- **左侧按钮:** 历史页面显示ViewSwitch
- **右侧按钮:** MenuButton，弹出设置/关于菜单
- **页面切换:** Tab切换动画，全屏页面滑入

### MobileLandscape（移动端横屏）

- **结构:** 左右分屏，左侧主卡片，右侧功能面板
- **左侧:** WaterCanvas(card模式) + AddButton + 数字显示
- **右侧:** 历史记录/设置/关于
- **TabBar:** 隐藏
- **左侧按钮:** ViewSwitch
- **右侧按钮:** MenuButton

### DesktopSplit（桌面/平板分屏）

- **结构:** 左右分屏，左侧主卡片，右侧功能面板
- **左侧:** WaterCanvas(card模式) + AddButton + 数字显示，固定尺寸居中
- **右侧:** 历史记录/设置/关于
- **TabBar:** 隐藏
- **左侧按钮:** ViewSwitch
- **右侧按钮:** MenuButton
- **特点:** 元素固定尺寸，不随屏幕拉伸

### WatchLayout（手表布局）

- **结构:** 全屏WaterCanvas + 内容层 + 全屏菜单覆盖
- **菜单:** 点击三点按钮，全屏菜单覆盖（历史/设置）
- **页面切换:** 全屏覆盖动画
- **屏幕形状:** 圆形/方形自适应（检测最小尺寸<220为圆形）
- **返回按钮:** 滚动时隐藏，停止后显示

---

## 实现任务

### Task 1: 整理共享组件

将现有 `src/shared/components/` 移动到 `src/components/`，更新导入路径。

### Task 2: 创建共享 hooks

整合 `src/store/` 和 `src/shared/hooks/` 到 `src/hooks/`，添加 `useLayout.ts`。

### Task 3: 创建页面组件

创建 `src/pages/` 目录，实现 SettingsPage、LanguagePage、GoalPage、AboutPage。

### Task 4: 创建布局组件

创建 `src/layouts/` 目录，实现四种布局组件。

### Task 5: 重构 AppMain

使用布局组件重构 `AppMain.tsx`，根据 `useLayout` 选择布局。

### Task 6: 重构 WatchApp

使用 WatchLayout 和共享组件重构 `WatchApp.tsx`。

### Task 7: 添加缺失功能

- 周视图柱状图
- 月视图日历网格
- 目标设置页面
- 关于页面
- 删除记录撤销提示

### Task 8: 测试和优化

- 验证三种布局切换
- 验证手表圆形/方形适配
- 验证摇树优化效果
- 验证国际化