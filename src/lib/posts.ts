import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Route, Post, RouteSummary, TagCount } from '@/types'

const ROUTES_DIR = path.join(process.cwd(), 'content', 'routes')
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

// ===== 确保目录存在 =====
export function ensureContentDirs() {
  if (!fs.existsSync(ROUTES_DIR)) fs.mkdirSync(ROUTES_DIR, { recursive: true })
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true })
}

// ===== 读取所有路线 =====
export function getAllRoutes(): Route[] {
  ensureContentDirs()
  const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.md'))
  return files.map(file => {
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(ROUTES_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      description: data.description || '',
      cover: data.cover || '',
      color: data.color || '#3b82f6',
      coordinates: (data.coordinates as [number, number][]) || [],
      tags: (data.tags as string[]) || [],
    } as Route
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export function getRouteBySlug(slug: string): Route | null {
  return getAllRoutes().find(r => r.slug === slug) || null
}

// ===== 读取所有日志 =====
export function getAllPosts(): Post[] {
  ensureContentDirs()
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
  return files.map(file => {
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      route: data.route || '',
      location: data.location || '',
      coordinates: (data.coordinates as [number, number]) || undefined,
      tags: (data.tags as string[]) || [],
      cover: data.cover || '',
      content,
    } as Post
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find(p => p.slug === slug) || null
}

export function getPostsByRoute(routeSlug: string): Post[] {
  return getAllPosts().filter(p => p.route === routeSlug)
}

export function getRoutesWithPostCount(): RouteSummary[] {
  const routes = getAllRoutes()
  const allPosts = getAllPosts()
  return routes.map(route => ({
    slug: route.slug,
    title: route.title,
    date: route.date,
    description: route.description,
    cover: route.cover,
    color: route.color,
    startPoint: route.coordinates.length > 0 ? route.coordinates[0] : undefined,
    postCount: allPosts.filter(p => p.route === route.slug).length,
  }))
}

export function getAllTags(): TagCount[] {
  const tagMap = new Map<string, number>()
  getAllPosts().forEach(post => post.tags?.forEach(tag => tagMap.set(tag, (tagMap.get(tag) || 0) + 1)))
  return Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count)
}

// ===== 全局统计 =====
export function getGlobalStats() {
  const routes = getAllRoutes()
  const posts = getAllPosts()
  const tags = getAllTags()

  // 计算总里程
  let totalKm = 0
  for (const route of routes) {
    for (let i = 1; i < route.coordinates.length; i++) {
      const [lat1, lng1] = route.coordinates[i - 1]
      const [lat2, lng2] = route.coordinates[i]
      const R = 6371
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
      totalKm += Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
    }
  }

  // 扫描照片数量
  let photoCount = 0
  function countPhotos(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) countPhotos(full)
      else if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(path.extname(entry.name).toLowerCase())) photoCount++
    }
  }
  countPhotos(IMAGES_DIR)

  return {
    routeCount: routes.length,
    postCount: posts.length,
    tagCount: tags.length,
    photoCount,
    totalKm,
  }
}
