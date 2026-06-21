import Link from "next/link"
import RouteMap from "@/components/Map/RouteMap"
import { getRoutesWithPostCount, getAllPosts, getAllTags, getGlobalStats } from "@/lib/posts"

export default function HomePage() {
  const routes = getRoutesWithPostCount()
  const latestPosts = getAllPosts().slice(0, 4)
  const tags = getAllTags().slice(0, 12)
  const stats = getGlobalStats()

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pb-28">
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-pine/10 blur-[120px] animate-float-glow" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-pine/5 blur-[100px] animate-float-glow" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-pine/20 bg-pine-light px-4 py-1.5 text-xs text-pine animate-slide-up">
            <span className="inline-block h-2 w-2 rounded-full bg-pine animate-pulse-pine" />
            🎉 爸爸父亲节快乐 · 自驾游旅行日志
          </div>

          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl animate-slide-up anim-delay-1">
            <span className="text-foreground">石头的</span>
            <br />
            <span className="bg-gradient-to-r from-pine to-[#0d9488] bg-clip-text text-transparent">
              自驾日志
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted animate-slide-up anim-delay-2">
            用方向盘丈量大地，用镜头定格风景
          </p>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm animate-slide-up anim-delay-3">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-pine">{routes.length}</span>
              <span className="text-xs text-subtle">条路线</span>
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-pine/30 to-transparent" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-pine">{latestPosts.length}</span>
              <span className="text-xs text-subtle">篇日志</span>
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-pine/30 to-transparent" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-pine">{tags.length}</span>
              <span className="text-xs text-subtle">个标签</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 地图 ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-20 lg:pb-28 animate-slide-up anim-delay-4">
        <div className="rounded-2xl bg-white p-1.5 animate-border-flow">
          <RouteMap routes={routes} />
        </div>
      </section>

      {/* ===== 路线 ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-0.5 rounded-full bg-pine" />
            <h2 className="text-lg font-semibold text-foreground">旅行路线</h2>
          </div>
          <Link href="/routes" className="text-xs text-muted hover:text-pine transition-colors duration-300">
            全部路线 →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.length > 0 ? (
            routes.map((route, i) => (
              <Link key={route.slug} href={`/routes/${route.slug}`}
                className="card-glow group rounded-xl border border-border bg-white p-5 animate-slide-up"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="h-0.5 w-8 rounded-full bg-pine/40 group-hover:bg-pine transition-all duration-500 mb-4" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-light text-xs font-medium text-pine group-hover:bg-pine/20 transition-all duration-300">
                    {route.slug.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-pine transition-colors duration-300">
                      {route.title}
                    </h3>
                    <p className="text-xs text-subtle">{route.date}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted line-clamp-2">{route.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-subtle">
                  <span className="flex items-center gap-1"><span className="inline-block h-1 w-1 rounded-full bg-pine/60 animate-pulse-pine" />{route.postCount} 篇</span>
                  {route.startPoint && <span>{route.startPoint[0].toFixed(1)}°N</span>}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-pine/20 p-16 text-center animate-slide-up">
              <p className="text-sm text-muted">还没有添加路线</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== 最新日志 ===== */}
      {latestPosts.length > 0 && (
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-5 w-0.5 rounded-full bg-pine" />
              <h2 className="text-lg font-semibold text-foreground">最新日志</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {latestPosts.map((post, i) => (
                <Link key={post.slug} href={`/posts/${post.slug}`}
                  className="card-glow group rounded-xl border border-border bg-white p-5 animate-slide-up"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <div className="h-0.5 w-6 rounded-full bg-pine/30 group-hover:bg-pine/60 transition-all duration-500 mb-3" />
                  <div className="flex items-center gap-2 text-xs text-subtle mb-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-pine/50 animate-pulse-pine" style={{ animationDelay: `${i * 0.5}s` }} />
                    <span>{post.date}</span><span className="text-border">·</span><span>{post.location}</span>
                  </div>
                  <h3 className="text-base font-medium text-foreground group-hover:text-pine transition-colors duration-300">{post.title}</h3>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-pine-light px-2.5 py-0.5 text-xs text-pine/70">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 标签 ===== */}
      {tags.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-5 w-0.5 rounded-full bg-pine" />
            <h2 className="text-sm font-medium text-foreground">标签</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <span key={tag}
                className="card-glow rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-muted hover:text-pine cursor-default"
              >
                #{tag}<span className="ml-1 text-subtle">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ===== 全局数据看板 ===== */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-5 w-0.5 rounded-full bg-pine" />
            <h2 className="text-sm font-medium text-foreground">旅行数据</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: '路线', value: stats.routeCount },
              { label: '日志', value: stats.postCount },
              { label: '里程(km)', value: stats.totalKm },
              { label: '照片', value: stats.photoCount },
              { label: '标签', value: stats.tagCount },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-white p-5 text-center card-glow">
                <p className="text-2xl font-bold text-pine">{s.value}</p>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部装饰 */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i}
              className="h-0.5 rounded-full bg-pine/30 animate-pulse-pine"
              style={{
                width: `${8 + i * 6}px`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
