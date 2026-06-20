'use client'

import { useState } from "react"
import Link from "next/link"

interface Image {
  src: string; title: string; location: string; date: string
  slug: string; routeSlug?: string  // 关联的路线
}
interface Props {
  initialImages: Image[]
  routes?: { slug: string; title: string }[]
}

export default function GalleryClient({ initialImages, routes = [] }: Props) {
  const [selected, setSelected] = useState<Image | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  // 根据 routeSlug 找路线标题
  const getRouteTitle = (slug?: string) => {
    if (!slug) return null
    const route = routes.find(r => r.slug === slug)
    return route ? route.title : slug
  }

  if (initialImages.length === 0) return (
    <div className="rounded-xl border border-dashed border-border p-20 text-center">
      <p className="text-sm text-subtle">照片集为空</p>
    </div>
  )

  return (
    <>
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {initialImages.map((img, i) => (
          <button key={img.src + i} onClick={() => setSelected(img)}
            className="group mb-3 w-full overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-sm"
          >
            <div className="aspect-[4/3] w-full bg-[#f0f0ee] relative overflow-hidden">
              {errors.has(img.src) ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl text-[#d4d4d8]">📷</span>
                </div>
              ) : (
                <img src={img.src} alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setErrors(prev => new Set(prev).add(img.src))}
                />
              )}
              {/* 路线标签 */}
              {img.routeSlug && (
                <div className="absolute top-2 left-2 rounded-md bg-black/40 backdrop-blur-sm px-2 py-0.5 text-xs text-white/90">
                  {getRouteTitle(img.routeSlug)}
                </div>
              )}
            </div>
            <div className="p-3 text-left">
              <p className="text-sm text-foreground truncate">{img.title}</p>
              <p className="text-xs text-subtle">{img.location}{img.date ? ` · ${img.date}` : ''}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="max-w-2xl w-full rounded-xl bg-white p-4 shadow-lg border border-border" onClick={e => e.stopPropagation()}>
            <div className="aspect-video w-full rounded-lg bg-[#f0f0ee] relative overflow-hidden">
              {errors.has(selected.src) ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl text-[#d4d4d8]">📷</span>
                </div>
              ) : (
                <img src={selected.src} alt={selected.title}
                  className="w-full h-full object-contain"
                  onError={() => setErrors(prev => new Set(prev).add(selected.src))}
                />
              )}
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium text-foreground">{selected.title}</h3>
                <p className="text-sm text-muted">
                  {selected.location}{selected.date ? ` · ${selected.date}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {selected.routeSlug && (
                  <Link href={`/routes/${selected.routeSlug}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors">
                    📍 路线
                  </Link>
                )}
                {selected.slug && (
                  <Link href={`/posts/${selected.slug}`}
                    className="rounded-lg bg-pine-light px-3 py-1.5 text-xs text-pine hover:bg-pine/20 transition-colors">
                    查看日志 →
                  </Link>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)}
              className="mt-3 w-full rounded-lg bg-surface py-2 text-xs text-muted hover:bg-border transition-colors">
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  )
}
