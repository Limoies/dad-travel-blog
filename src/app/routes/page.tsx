import Link from "next/link"
import { getRoutesWithPostCount } from "@/lib/posts"

export default function RoutesPage() {
  const routes = getRoutesWithPostCount()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-subtle tracking-wider">ROUTES</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">旅行路线</h1>
        <p className="mt-1 text-sm text-muted">石头用方向盘走过的每一段路</p>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-20 text-center">
          <p className="text-sm text-subtle">还没有添加路线</p>
        </div>
      ) : (
        <div className="space-y-2">
          {routes.map((route, index) => (
            <Link key={route.slug} href={`/routes/${route.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:shadow-sm"
            >
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-xs text-subtle font-medium">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">{route.title}</h2>
                <p className="mt-0.5 text-xs text-muted line-clamp-1">{route.description}</p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-subtle">
                  <span>{route.date}</span>
                  <span>{route.postCount} 篇日志</span>
                </div>
              </div>
              <span className="shrink-0 text-subtle group-hover:text-foreground transition-colors text-sm">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
