import Link from "next/link"
import type { Post } from "@/types"

interface Props { posts: Post[] }

export default function Timeline({ posts }: Props) {
  return (
    <div className="relative">
      {/* 时间轴竖线 */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-pine/40 via-pine/20 to-transparent" />

      <div className="space-y-6">
        {posts.map((post, i) => (
          <div key={post.slug} className="group relative flex gap-5">
            {/* 时间点 */}
            <div className="relative z-10 flex shrink-0 flex-col items-center">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-pine/30 bg-white text-xs font-bold text-pine shadow-sm">
                {i + 1}
              </div>
            </div>

            {/* 内容卡片 */}
            <div className="flex-1 min-w-0 pb-2">
              <Link href={`/posts/${post.slug}`}
                className="block rounded-xl border border-border bg-white p-4 transition-all hover:shadow-sm hover:border-pine/20 group/card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-subtle mb-1">
                      <span>{post.date}</span>
                      <span className="text-border">·</span>
                      <span>{post.location}</span>
                      {post.coordinates && (
                        <span className="text-border/60">{post.coordinates[0].toFixed(2)}°N</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover/card:text-pine transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  <span className="shrink-0 text-subtle group-hover/card:text-pine transition-colors text-sm mt-5">→</span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">#{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
