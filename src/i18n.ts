import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        glasses: 'glasses',
        glass: 'glass',
        todayDrinks: 'Today',
        history: 'History',
        settings: 'Settings',
        save: 'Save',
        noRecords: 'No records',
      },
    },
    zh: {
      translation: {
        glasses: '杯',
        glass: '杯',
        todayDrinks: '今日',
        history: '历史记录',
        settings: '设置',
        save: '保存',
        noRecords: '暂无记录',
      },
    },
  },
  lng: localStorage.getItem('lang') || 'zh',
  interpolation: { escapeValue: false },
})

export default i18n