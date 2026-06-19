export type ThemeStatus = '待整理' | '可使用' | '需补充' | '仅展示' | '暂缓'

export type DifficultyLevel = '简单' | '中等' | '困难'

export type PageType = '封面' | '内页' | '分隔页' | '口袋页' | '折叠页' | '装饰页'

export type ColorScheme =
  | '粉色系'
  | '蓝色系'
  | '绿色系'
  | '黄色系'
  | '紫色系'
  | '橙色系'
  | '红色系'
  | '黑白灰'
  | '莫兰迪'
  | '复古色'
  | '马卡龙'
  | '大地色'

export interface StickerTheme {
  id: string
  name: string
  colorScheme: ColorScheme
  stickerCount: number
  suitablePages: PageType[]
  example: string
  difficulty: DifficultyLevel
  estimatedTime: number
  responsible: string
  status: ThemeStatus
  notes: string
  todos: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface Filters {
  colorScheme: ColorScheme | ''
  pageType: PageType | ''
  difficulty: DifficultyLevel | ''
  status: ThemeStatus | ''
  responsible: string
}

export interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  themeId?: string
}

export interface ActivityPackage {
  groupName: string
  themes: StickerTheme[]
  totalStickers: number
  gaps: string[]
}
