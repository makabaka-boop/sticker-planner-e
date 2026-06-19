# 手账贴纸主题整理页 - 技术架构文档

## 1. 架构设计

纯前端单页应用，无后端服务，数据持久化使用浏览器 LocalStorage。

```mermaid
flowchart TD
    "Vue3 应用层" --> "组件层"
    "组件层" --> "状态管理层"
    "状态管理层" --> "工具层"
    "工具层" --> "本地存储"
    
    subgraph "组件层"
        "主页组件"
        "筛选栏组件"
        "主题卡片组件"
        "详情侧边栏组件"
        "批量操作栏组件"
        "活动包预览组件"
        "智能提示组件"
        "表单对话框组件"
    end
    
    subgraph "状态管理层"
        "Theme Store"
    end
    
    subgraph "工具层"
        "存储工具"
        "提示生成器"
        "拖拽排序"
        "ID 生成器"
    end
```

## 2. 技术说明

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 5
- **类型系统**: TypeScript 5
- **样式方案**: Tailwind CSS 3
- **图标库**: Lucide Vue Next
- **拖拽库**: vuedraggable@next (基于 Sortable.js)
- **状态管理**: Pinia (可选，也可使用 Vue 3 reactive + provide/inject)
- **初始化工具**: create-vue (Vue 官方脚手架)

## 3. 目录结构

```
src/
├── components/          # 组件目录
│   ├── FilterBar.vue         # 筛选栏
│   ├── ThemeCard.vue         # 主题卡片
│   ├── ThemeDetailDrawer.vue # 详情侧边栏
│   ├── BulkActionBar.vue     # 批量操作栏
│   ├── PackagePreview.vue    # 活动包预览
│   ├── SmartTipCenter.vue    # 智能提示中心
│   ├── ThemeFormDialog.vue   # 新增/编辑表单对话框
│   ├── StatsHeader.vue       # 统计头部
│   ├── ColorDot.vue          # 色系圆点
│   ├── StatusBadge.vue       # 状态徽章
│   └── DifficultyStars.vue   # 难度星级
├── composables/         # 组合式函数
│   ├── useThemeStore.ts      # 主题数据状态管理
│   └── useSmartTips.ts       # 智能提示逻辑
├── types/               # 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── storage.ts            # LocalStorage 封装
│   └── id.ts                 # ID 生成
├── pages/               # 页面
│   └── HomePage.vue          # 主页
├── App.vue
├── main.ts
└── style.css            # 全局样式 + Tailwind
```

## 4. 路由定义

由于是单页应用，使用简单的视图切换而非 vue-router：
| 视图模式 | 说明 |
|---------|------|
| list | 主题列表管理视图（默认） |
| preview | 活动包预览视图 |

## 5. 数据模型

### 5.1 TypeScript 类型定义

```typescript
// 状态枚举
type ThemeStatus = 'pending' | 'ready' | 'needSupplement' | 'displayOnly' | 'shelved'

// 色系
type ColorScheme = 'peachPink' | 'mintGreen' | 'lemonYellow' | 'lavenderPurple' | 'skyBlue' | 'creamWhite' | 'other'

// 页型
type PageType = 'cover' | 'titlePage' | 'monthly' | 'weekly' | 'daily' | 'collage' | 'decoration'

// 待办项
interface TodoItem {
  id: string
  text: string
  done: boolean
}

// 主题记录
interface ThemeRecord {
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

// 筛选条件
interface FilterState {
  colorScheme: ColorScheme | ''
  pageType: PageType | ''
  difficulty: number | ''
  status: ThemeStatus | ''
  assignee: string
  keyword: string
}

// 智能提示类型
type TipType = 'warning' | 'error' | 'info'

interface SmartTip {
  id: string
  type: TipType
  message: string
  themeId?: string
}

// 活动包预览配置
interface PreviewConfig {
  groupCount: number
  stickersPerGroup: number
}
```

### 5.2 状态常量映射

```typescript
const STATUS_MAP: Record<ThemeStatus, { label: string; color: string }> = {
  pending: { label: '待整理', color: '#f59e0b' },
  ready: { label: '可使用', color: '#10b981' },
  needSupplement: { label: '需补充', color: '#ef4444' },
  displayOnly: { label: '仅展示', color: '#6366f1' },
  shelved: { label: '暂缓', color: '#9ca3af' }
}

const COLOR_MAP: Record<ColorScheme, { label: string; hex: string }> = {
  peachPink: { label: '蜜桃粉', hex: '#fda4af' },
  mintGreen: { label: '薄荷绿', hex: '#86efac' },
  lemonYellow: { label: '鹅黄', hex: '#fde047' },
  lavenderPurple: { label: '薰衣草紫', hex: '#c4b5fd' },
  skyBlue: { label: '天空蓝', hex: '#7dd3fc' },
  creamWhite: { label: '奶油白', hex: '#fef3c7' },
  other: { label: '其他', hex: '#d1d5db' }
}

const PAGE_TYPE_MAP: Record<PageType, string> = {
  cover: '封面',
  titlePage: '扉页',
  monthly: '月计划',
  weekly: '周计划',
  daily: '日记录',
  collage: '拼贴页',
  decoration: '装饰页'
}
```

## 6. 核心功能实现要点

### 6.1 本地存储
- 使用 `localStorage` 存储，key 为 `sticker-planner-data`
- 数据变更时自动防抖保存（300ms）
- 初始化时读取本地数据，若无则使用示例数据

### 6.2 智能提示规则
1. **贴纸数量不足**: stickerCount < 5
2. **主题名重复**: 存在相同 themeName（忽略大小写）
3. **同色系集中**: 同一色系下主题数量 > 3
4. **预计用时过长**: estimatedTime > 60 分钟
5. **备注缺失**: notes 为空且 status 不是 'shelved'

### 6.3 拖拽排序
- 使用 vuedraggable 实现卡片拖拽
- 拖拽结束后重新计算 order 字段
- 保留筛选状态下的拖拽（仅对筛选结果排序）

### 6.4 活动包预览
- 根据当前筛选结果（仅状态为 'ready' 或 'needSupplement'）分配
- 按色系均衡分配给各个小组
- 统计每组可用贴纸总数
- 标记缺口：当某主题 stickerCount < groupCount 时标记
