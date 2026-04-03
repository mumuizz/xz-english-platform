export const colors = {
  primary: '#ef233c',
  primaryDark: '#d91e36',
  dark: '#2b2d42',
  darkLight: '#3f4564',
  gray: '#8d99ae',
  bgLight: '#edf2f4',
  bgCard: '#f8f9fa',
  border: '#e9ecef',
  borderLight: '#e5e7eb',
  success: '#10b981',
  successDark: '#065f46',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  purpleDark: '#7c3aed',
  orange: '#f97316',
} as const

export const levelConfig = {
  beginner: { label: '初级', color: colors.success },
  intermediate: { label: '中级', color: colors.warning },
  advanced: { label: '高级', color: colors.primary },
} as const

export const listeningTypeConfig = {
  news: { label: '新闻', icon: 'N' },
  dialogue: { label: '对话', icon: 'D' },
  lecture: { label: '讲解', icon: 'L' },
  story: { label: '磨耳朵', icon: 'S' },
} as const
