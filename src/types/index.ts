export type ThemeStatus = 'pending' | 'ready' | 'needSupplement' | 'displayOnly' | 'shelved'

export type ColorScheme = 'peachPink' | 'mintGreen' | 'lemonYellow' | 'lavenderPurple' | 'skyBlue' | 'creamWhite' | 'other'

export type PageType = 'cover' | 'titlePage' | 'monthly' | 'weekly' | 'daily' | 'collage' | 'decoration'

export type TipType = 'warning' | 'error' | 'info'

export interface TodoItem {
  id: string
  text: string
  done: boolean
}

export interface ThemeRecord {
  id: string
  themeName: string
  colorScheme: ColorScheme
  stickerCount: number
  pageTypes: PageType[]
  exampleDesc: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedTime: number
  assignee: string
  status: ThemeStatus
  notes: string
  todos: TodoItem[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface FilterState {
  colorScheme: ColorScheme | ''
  pageType: PageType | ''
  difficulty: number | ''
  status: ThemeStatus | ''
  assignee: string
  keyword: string
}

export interface SmartTip {
  id: string
  type: TipType
  message: string
  themeId?: string
}

export interface PreviewConfig {
  groupCount: number
  stickersPerGroup: number
}

export const STATUS_MAP: Record<ThemeStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待整理', color: '#f59e0b', bg: '#fef3c7' },
  ready: { label: '可使用', color: '#10b981', bg: '#d1fae5' },
  needSupplement: { label: '需补充', color: '#ef4444', bg: '#fee2e2' },
  displayOnly: { label: '仅展示', color: '#6366f1', bg: '#e0e7ff' },
  shelved: { label: '暂缓', color: '#9ca3af', bg: '#f3f4f6' }
}

export const COLOR_MAP: Record<ColorScheme, { label: string; hex: string }> = {
  peachPink: { label: '蜜桃粉', hex: '#fda4af' },
  mintGreen: { label: '薄荷绿', hex: '#86efac' },
  lemonYellow: { label: '鹅黄', hex: '#fde047' },
  lavenderPurple: { label: '薰衣草紫', hex: '#c4b5fd' },
  skyBlue: { label: '天空蓝', hex: '#7dd3fc' },
  creamWhite: { label: '奶油白', hex: '#fef3c7' },
  other: { label: '其他', hex: '#d1d5db' }
}

export const PAGE_TYPE_MAP: Record<PageType, string> = {
  cover: '封面',
  titlePage: '扉页',
  monthly: '月计划',
  weekly: '周计划',
  daily: '日记录',
  collage: '拼贴页',
  decoration: '装饰页'
}
