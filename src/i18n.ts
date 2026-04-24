import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      title: 'Hydrate Daily',
      subtitle: 'Stay healthy, stay hydrated',
      home: 'Home',
      glasses: 'glasses',
      goalReached: 'Goal reached!',
      keepGoing: 'Keep going!',
      remindersEvery: 'Reminders every {minutes} min',
      enableReminders: 'Enable reminders',
      settings: 'Settings',
      dailyGoal: 'Daily Goal (glasses)',
      reminders: 'Reminders',
      interval: 'Interval: {minutes} minutes',
      cancel: 'Cancel',
      save: 'Save',
      resetToday: 'Reset Today',
      todayDrinks: "Today's drinks",
      viewAll: 'View all',
      noRecords: 'No records yet',
      summary: 'Summary',
      totalDrinks: 'Total drinks',
      dayStreak: 'Day streak',
      history: 'History',
      language: 'Language',
      about: 'About',
      privacy: 'Privacy Policy',
      notificationTitle: 'Time to drink water!',
      notificationBody: "You've had {today}/{goal} glasses today. Stay hydrated!",
      appName: 'Water Reminder',
      appDescription: 'A simple and beautiful water tracking app to help you stay hydrated throughout the day.',
      version: 'Version',
      developer: 'Developer',
      privacyDescription: 'We value your privacy. This privacy policy explains how we collect, use, and protect your information.',
      dataCollected: 'Data We Collect',
      dataCollected1: 'Your daily water intake records',
      dataCollected2: 'Your daily goal settings',
      dataCollected3: 'Your language preference',
      dataUsage: 'How We Use Your Data',
      dataUsage1: 'To track your daily water intake',
      dataUsage2: 'To provide personalized reminders',
      dataStorage: 'All your data is stored locally on your device using localStorage. We do not collect or store any data on our servers.',
      dataDeletion: 'You can delete all your data by using the "Reset Today" feature in settings or by clearing your browser\'s local storage.',
    }
  },
  zh: {
    translation: {
      title: '每日饮水',
      subtitle: '保持健康，保持水分',
      home: '首页',
      glasses: '杯',
      goalReached: '目标达成！',
      keepGoing: '继续加油！',
      remindersEvery: '每 {minutes} 分钟提醒',
      enableReminders: '开启提醒',
      settings: '设置',
      dailyGoal: '每日目标（杯）',
      reminders: '提醒',
      interval: '间隔：{minutes} 分钟',
      cancel: '取消',
      save: '保存',
      resetToday: '重置今天',
      todayDrinks: '今日饮水',
      viewAll: '查看全部',
      noRecords: '暂无记录',
      summary: '统计',
      totalDrinks: '总饮水次数',
      dayStreak: '连续天数',
      history: '历史记录',
      language: '语言',
      about: '关于',
      privacy: '隐私政策',
      notificationTitle: '该喝水了！',
      notificationBody: '今天已喝 {today}/{goal} 杯水。保持水分充足！',
      appName: '饮水提醒',
      appDescription: '一个简洁美观的饮水记录应用，帮助你全天保持水分充足。',
      version: '版本',
      developer: '开发者',
      privacyDescription: '我们重视您的隐私。本隐私政策说明了我们如何收集、使用和保护您的信息。',
      dataCollected: '我们收集的数据',
      dataCollected1: '您的每日饮水记录',
      dataCollected2: '您的每日目标设置',
      dataCollected3: '您的语言偏好',
      dataUsage: '我们如何使用您的数据',
      dataUsage1: '用于跟踪您的每日饮水量',
      dataUsage2: '用于提供个性化提醒',
      dataStorage: '您的所有数据都存储在您设备的本地存储中。我们不会在服务器上收集或存储任何数据。',
      dataDeletion: '您可以通过设置中的"重置今天"功能或清除浏览器的本地存储来删除所有数据。',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
