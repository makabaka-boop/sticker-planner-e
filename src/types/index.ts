export type Status = '待整理' | '可使用' | '需补充' | '仅展示' | '暂缓'
export type Difficulty = '简单' | '中等' | '困难'
export type PageType = '满版' | '半版' | '边角' | '边框' | '插页'

export interface TodoItem {
  id: string
  text: string
  done: boolean
}

export interface StickerTheme {
  id: string
  name: string
  colorScheme: string
  stickerCount: number
  pageTypes: PageType[]
  example: string
  difficulty: Difficulty
  estimatedTime: number
  owner: string
  status: Status
  notes: string
  todos: TodoItem[]
  order: number
}

export interface FilterState {
  colorScheme: string
  pageType: string
  difficulty: string
  status: string
  owner: string
}

export interface SystemAlert {
  id: string
  themeId: string
  themeName: string
  type: 'low_stock' | 'duplicate_name' | 'color_concentration' | 'long_time' | 'missing_notes'
  message: string
  level: 'warning' | 'error' | 'info'
}

export interface ActivityGroup {
  name: string
  themes: StickerTheme[]
  totalStickers: number
  gaps: string[]
}
