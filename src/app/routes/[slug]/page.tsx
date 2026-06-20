import Link from "next/link"
import { notFound } from "next/navigation"
import { getRouteBySlug, getPostsByRoute, getAllRoutes } from "@/lib/posts"
import RouteDetailMap from "./RouteDetailMap"
import Timeline from "./Timeline"

// 估算两点间距离（km）
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllRoutes().map(r => ({ slug: r.slug }))
}

export default async function RouteDetailPage({ params }: Props) {
  const { slug } = await params
  const route = getRouteBySlug(slug)
  if (!route) notFound()
  const posts = getPostsByRoute(slug)

  // 计算总里程
  let totalKm = 0
  for (let i = 1; i < route.coordinates.length; i++) {
    totalKm += calcDistance(
      route.coordinates[i - 1][0], route.coordinates[i - 1][1],
      route.coordinates[i][0], route.coordinates[i][1],
    )
  }

  // 统计
  const stats = [
    { label: '里程', value: `${totalKm}`, unit: 'km' },
    { label: '站点', value: `${route.coordinates.length}`, unit: '个' },
    { label: '日志', value: `${posts.length}`, unit: '篇' },
    { label: '标签', value: `${route.tags?.length || 0}`, unit: '个' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* 面包屑 */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-subtle">
        <Link href="/" className="hover:text-foreground transition-colors">首页</Link>
        <span className="text-border">/</span>
        <Link href="/routes" className="hover:text-foreground transition-colors">路线</Link>
        <span className="text-border">/</span>
        <span className="text-muted">{route.title}</span>
      </nav>

      {/* 标题区 */}
      <div className="mb-10">
        <p className="text-xs text-subtle tracking-wider mb-2">ROUTE</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{route.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">{route.description}</p>

        {/* 统计卡片 */}
        <div className="mt-5 flex flex-wrap gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-white px-4 py-2.5 text-center min-w-[80px]">
              <p className="text-lg font-bold text-pine">{s.value}</p>
              <p className="text-xs text-subtle">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-subtle">
          <span>{route.date}</span>
        </div>
        {route.tags && route.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {route.tags.map(t => <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">#{t}</span>)}
          </div>
        )}
      </div>

      {/* 地图 */}
      {route.coordinates.length > 1 && (
        <div className="mb-14">
          <RouteDetailMap route={route} posts={posts} />
        </div>
      )}

      {/* 时间线 */}
      <div className="mb-14">
        <h2 className="mb-6 text-sm font-medium text-muted tracking-wide">📖 旅途日志</h2>
        {posts.length > 0 ? (
          <Timeline posts={posts} />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-14 text-center text-sm text-subtle">还没有日志</div>
        )}
      </div>
    </div>
  )
}
