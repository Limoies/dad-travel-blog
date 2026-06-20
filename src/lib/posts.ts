import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Route, Post, RouteSummary, TagCount } from '@/types'

const ROUTES_DIR = path.join(process.cwd(), 'content', 'routes')
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO || 'Limoies/dad-travel-blog'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

// 通过 GitHub API 获取文件内容
async function fetchFromGitHub(filePath: string): Promise<string | null> {
  if (!GITHUB_TOKEN) return null
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 30 }, // 缓存30秒
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.content) return null
    return Buffer.from(data.content, 'base64').toString('utf-8')
  } catch {
    return null
  }
}

// 通过 GitHub API 获取目录下所有文件
async function listFromGitHub(dir: string): Promise<string[]> {
  if (!GITHUB_TOKEN) return []
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${dir}?ref=${GITHUB_BRANCH}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data as any[])
      .filter((item: any) => item.name.endsWith('.md'))
      .map((item: any) => item.name)
  } catch {
    return []
  }
}

// ===== 确保目录存在 =====
export function ensureContentDirs() {
  if (!fs.existsSync(ROUTES_DIR)) fs.mkdirSync(ROUTES_DIR, { recursive: true })
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true })
}

// ===== 读取单个 Markdown 文件 =====
function readMdFile(filePath: string): { data: any; content: string } | null {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return matter(raw)
    }
  } catch { /* 忽略 */ }
  return null
}

// ===== 读取所有路线 =====
export function getAllRoutes(): Route[] {
  ensureContentDirs()
  const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.md'))
  return files.map(file => {
    const slug = file.replace(/\.md$/, '')
    const parsed = readMdFile(path.join(ROUTES_DIR, file))
    const data = parsed?.data || {}
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
  const posts = files.map(file => {
    const slug = file.replace(/\.md$/, '')
    const parsed = readMdFile(path.join(POSTS_DIR, file))
    if (!parsed) return null
    const { data, content } = parsed
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
  }).filter(Boolean) as Post[]
  return posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts()
  return posts.find(p => p.slug === slug) || null
}

/** 从文件系统 + GitHub API 获取日志（确保新添加的也能读到） */
export async function getPostBySlugAsync(slug: string): Promise<Post | null> {
  // 先尝试本地文件
  const local = getPostBySlug(slug)
  if (local) return local

  // 本地没有，从 GitHub API 获取
  const filePath = `content/posts/${slug}.md`
  const raw = await fetchFromGitHub(filePath)
  if (!raw) return null

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
  return { routeCount: routes.length, postCount: posts.length, tagCount: tags.length, photoCount, totalKm }
}
