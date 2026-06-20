import fs from 'fs'
import path from 'path'
import { getAllPosts, getAllRoutes } from "@/lib/posts"
import GalleryClient from "./GalleryClient"

const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']

/** 递归扫描目录下所有图片 */
function scanDir(dir: string, baseUrl: string, routeSlug?: string): any[] {
  if (!fs.existsSync(dir)) return []
  const results: any[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath, `${baseUrl}/${entry.name}`, entry.name))
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (IMG_EXTS.includes(ext)) {
        results.push({
          src: `${baseUrl}/${encodeURIComponent(entry.name)}`,
          title: entry.name.replace(/\.\w+$/, '').replace(/[_-]/g, ' '),
          location: routeSlug || '旅途',
          date: '',
          slug: '',
          routeSlug,
        })
      }
    }
  }
  return results
}

export default function GalleryPage() {
  const posts = getAllPosts()
  const routes = getAllRoutes()
  const imagesDir = path.join(process.cwd(), 'public', 'images')

  // 扫描 images 目录
  const dirImages = scanDir(imagesDir, '/images')

  // 日志封面图片
  const postImages = posts.filter(p => p.cover).map(p => ({
    src: p.cover!,
    title: p.title,
    location: p.location,
    date: p.date,
    slug: p.slug,
    routeSlug: p.route,
  }))

  // 合并去重
  const seen = new Set<string>()
  const merged = [...dirImages, ...postImages].filter(img => {
    if (seen.has(img.src)) return false
    seen.add(img.src)
    return true
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-subtle tracking-wider">GALLERY</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">照片墙</h1>
        <p className="mt-1 text-sm text-muted">老爸镜头里的风景</p>
        {dirImages.length > 0 && (
          <p className="mt-2 text-xs text-pine">📸 {dirImages.length} 张照片</p>
        )}
      </div>
      <GalleryClient initialImages={merged} routes={routes} />
    </div>
  )
}
