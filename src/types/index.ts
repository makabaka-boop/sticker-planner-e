export type ThemeStatus = 'pending' | 'ready' | 'shortage' | 'displayOnly' | 'paused'

export type ViewMode = 'organize' | 'packagePreview'

export interface TodoItem {
  id: string
  content: string
  done: boolean
  createdAt: number
}

export interface StickerTheme {
  id: string
  name: string
  colorFamily: string
  stickerCount: number
  pageTypes: string[]
  example: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  owner: string
  status: ThemeStatus
  note: string
  todos: TodoItem[]
  order: number
  createdAt: number
  updatedAt: number
}

export interface PlannerSettings {
  colorFamilies: string[]
  pageTypes: string[]
  owners: string[]
  viewMode: ViewMode
}

export type SmartTipType =
  | 'lowCount'
  | 'duplicateName'
  | 'colorClustered'
  | 'longDuration'
  | 'missingNote'

export interface SmartTip {
  id: string
  type: SmartTipType
  level: 'info' | 'warning'
  themeIds: string[]
  message: string
}

export interface FilterState {
  colorFamilies: string[]
  pageTypes: string[]
  difficulties: number[]
  statuses: ThemeStatus[]
  owners: string[]
  keyword: string
}

export const STATUS_LABEL: Record<ThemeStatus, string> = {
  pending: '待整理',
  ready: '可使用',
  shortage: '需补充',
  displayOnly: '仅展示',
  paused: '暂缓',
}

export const STATUS_ORDER: ThemeStatus[] = [
  'pending',
  'ready',
  'shortage',
  'displayOnly',
  'paused',
]

export const COLOR_HEX: Record<string, string> = {
  枫叶橙: '#D9532C',
  苔藓绿: '#5C7A3A',
  雾蓝: '#6B8AA8',
  樱粉: '#E8A4B5',
  墨黑: '#1F1B16',
  米白: '#E9DFC7',
  暖棕: '#8C5A2B',
  紫藤: '#7E6BA8',
}

export const STATUS_COLOR: Record<ThemeStatus, string> = {
  pending: '#8C5A2B',
  ready: '#5C7A3A',
  shortage: '#D9532C',
  displayOnly: '#6B8AA8',
  paused: '#9B9282',
}
