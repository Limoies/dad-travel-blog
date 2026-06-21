import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  const result: { src: string; route: string }[] = []

  function scan(dir: string, baseUrl: string) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scan(full, `${baseUrl}/${entry.name}`)
      } else if (IMG_EXTS.includes(path.extname(entry.name).toLowerCase())) {
        result.push({
          src: `${baseUrl}/${encodeURIComponent(entry.name)}`,
          route: baseUrl.replace('/images/', '') || '根目录',
        })
      }
    }
  }

  scan(imagesDir, '/images')
  return NextResponse.json({ images: result })
}
