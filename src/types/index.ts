// ===== 自驾游日志网站 - 类型定义 =====

/** 路线信息 */
export interface Route {
  slug: string
  title: string
  date: string
  description: string
  cover?: string
  color?: string // 路线在地图上的颜色
  coordinates: [number, number][] // 路线途径坐标数组 [lat, lng]
  tags?: string[]
}

/** 单篇日志 */
export interface Post {
  slug: string
  title: string
  date: string
  route: string // 所属路线slug
  location: string
  coordinates?: [number, number] // 该日志对应的地点坐标
  tags?: string[]
  cover?: string
  content: string // Markdown正文
}

/** 首页展示的路线摘要 */
export interface RouteSummary {
  slug: string
  title: string
  date: string
  description: string
  cover?: string
  color?: string
  startPoint?: [number, number]
  postCount?: number
}

/** 标签云 */
export interface TagCount {
  tag: string
  count: number
}
