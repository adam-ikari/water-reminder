import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        glasses: 'glasses',
        of: 'of',
        today: 'Today',
        history: 'History',
        settings: 'Settings',
        darkMode: 'Dark Mode',
        noRecords: 'No records yet',
        goalReached: 'Goal reached!',
      },
    },
    zh: {
      translation: {
        glasses: '杯',
        of: '共',
        today: '今日',
        history: '历史',
        settings: '设置',
        darkMode: '深色模式',
        noRecords: '暂无记录',
        goalReached: '目标达成！',
      },
    },
  },
  lng: localStorage.getItem('lang') || 'zh',
  interpolation: { escapeValue: false },
})

export default i18n
