import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO || 'Limoies/dad-travel-blog'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'post'
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: '缺少 slug' }, { status: 400 })

  const dir = type === 'post' ? 'content/posts' : 'content/routes'

  // 先尝试本地文件
  const localPath = path.join(process.cwd(), dir, `${slug}.md`)
  if (fs.existsSync(localPath)) {
    const raw = fs.readFileSync(localPath, 'utf-8')
    const { data, content } = matter(raw)
    return NextResponse.json({ success: true, data, content, raw, slug })
  }

  // 从 GitHub API 获取
  if (GITHUB_TOKEN) {
    try {
      const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${dir}/${slug}.md?ref=${GITHUB_BRANCH}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
      })
      if (res.ok) {
        const fileData = await res.json()
        const raw = Buffer.from(fileData.content, 'base64').toString('utf-8')
        const { data, content } = matter(raw)
        return NextResponse.json({ success: true, data, content, raw, slug })
      }
    } catch {}
  }

  return NextResponse.json({ error: '文件不存在' }, { status: 404 })
}
