import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        glasses: 'glasses',
        todayDrinks: 'Today',
        settings: 'Settings',
        save: 'Save',
      },
    },
    zh: {
      translation: {
        glasses: '杯',
        todayDrinks: '今日',
        settings: '设置',
        save: '保存',
      },
    },
  },
  lng: localStorage.getItem('lang') || 'zh',
  interpolation: { escapeValue: false },
})

export default i18n