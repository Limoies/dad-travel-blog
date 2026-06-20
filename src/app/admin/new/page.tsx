'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; content?: string; needManualCopy?: boolean } | null>(null)

  // 表单数据
  const [type, setType] = useState<'post' | 'route'>('post')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [route, setRoute] = useState('')
  const [location, setLocation] = useState('')
  const [coordinates, setCoordinates] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('admin_logged_in')
    if (saved !== 'true') router.push('/admin')
    else setLoggedIn(true)
  }, [router])

  // 自动生成 slug
  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val))
    }
  }

  // 生成 Markdown
  const generateMarkdown = () => {
    let md = '---\n'
    md += `title: "${title}"\n`
    md += `date: "${date}"\n`
    if (type === 'post') {
      md += `route: "${route}"\n`
      md += `location: "${location}"\n`
    }
    if (coordinates) {
      try {
        const coords = JSON.parse(coordinates)
        if (type === 'post') md += `coordinates: [${coords[0]}, ${coords[1]}]\n`
        else md += `coordinates:\n${coords.map((c: number[]) => `  - [${c[0]}, ${c[1]}]`).join('\n')}\n`
      } catch { /* 不处理 */ }
    }
    if (tags) {
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)
      md += `tags: [${tagArr.map(t => `"${t}"`).join(', ')}]\n`
    }
    md += '---\n\n'
    md += content
    return md
  }

  const handleSave = async () => {
    if (!title) return
    setSaving(true)
    setResult(null)

    const md = generateMarkdown()
    const finalSlug = slug || generateSlug(title)

    try {
      const res = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slug: finalSlug, content: md }),
      })
      const data = await res.json()
      setResult(data)

      // 如果需要手动复制，显示 Markdown 内容
      if (data.needManualCopy) {
        setResult({ ...data, content: md })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (!loggedIn) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 顶部 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">✍️ 写日志</h1>
          <p className="text-xs text-muted mt-0.5">写下旅途中的故事</p>
        </div>
        <button onClick={() => router.push('/admin')}
          className="rounded-lg border border-border bg-white px-4 py-2 text-xs text-muted hover:text-foreground transition-colors">
          ← 返回管理
        </button>
      </div>

      {/* 表单 */}
      <div className="space-y-4">
        {/* 类型切换 */}
        <div className="flex gap-2">
          {(['post', 'route'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                type === t ? 'bg-pine text-white' : 'bg-surface text-muted hover:text-foreground'
              }`}>
              {t === 'post' ? '📝 写日志' : '📍 新建路线'}
            </button>
          ))}
        </div>

        {/* 标题 */}
        <div>
          <label className="text-xs text-muted mb-1 block">标题 *</label>
          <input value={title} onChange={e => handleTitleChange(e.target.value)}
            placeholder="例：吐鲁番一日游"
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
        </div>

        {/* Slug + 日期 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mb-1 block">标识 (slug)</label>
            <input value={slug} onChange={e => setSlug(e.target.value)}
              placeholder="自动生成"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">日期</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-pine/40 transition-all" />
          </div>
        </div>

        {/* 路线 + 地点（仅日志） */}
        {type === 'post' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block">所属路线</label>
              <input value={route} onChange={e => setRoute(e.target.value)}
                placeholder="如：turpan"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">地点</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="如：吐鲁番"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
            </div>
          </div>
        )}

        {/* 坐标 */}
        <div>
          <label className="text-xs text-muted mb-1 block">
            坐标 {type === 'post' ? '（如 [43.82, 87.62]）' : '（如 [[43.82, 87.62], [42.95, 89.18]]）'}
          </label>
          <input value={coordinates} onChange={e => setCoordinates(e.target.value)}
            placeholder={type === 'post' ? '[纬度, 经度]' : '[[纬度, 经度], [纬度, 经度]]'}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
        </div>

        {/* 标签 */}
        <div>
          <label className="text-xs text-muted mb-1 block">标签（逗号分隔）</label>
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="新疆, 吐鲁番, 自驾"
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
        </div>

        {/* 正文 */}
        <div>
          <label className="text-xs text-muted mb-1 block">正文（支持 Markdown）</label>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={`## 标题\n\n写你的旅行故事...\n\n![图片描述](/images/turpan/turpan-1.jpg)`}
            rows={10}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all resize-y font-mono" />
        </div>

        {/* 保存按钮 */}
        <button onClick={handleSave} disabled={saving || !title}
          className="w-full rounded-lg bg-pine py-3 text-sm font-medium text-white hover:bg-pine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {saving ? '保存中...' : '💾 保存并发布'}
        </button>

        {/* 结果提示 */}
        {result && (
          <div className={`rounded-xl border p-4 text-sm ${
            result.success ? 'border-pine/20 bg-pine-light text-pine' :
            result.needManualCopy ? 'border-amber-200 bg-amber-50 text-amber-800' :
            'border-red-200 bg-red-50 text-red-700'
          }`}>
            <p>{result.message || (result.success ? '✅ 保存成功！' : '❌ 保存失败')}</p>
            {result.needManualCopy && result.content && (
              <div className="mt-3">
                <p className="text-xs mb-2">请复制下方内容，到 GitHub 仓库的 <code className="bg-amber-100 px-1 rounded">content/posts/</code> 目录下新建文件粘贴：</p>
                <textarea readOnly value={result.content}
                  rows={8}
                  className="w-full rounded-lg border border-amber-200 bg-white p-3 text-xs font-mono text-amber-900" />
              </div>
            )}
          </div>
        )}

        {/* 快捷说明 */}
        <details className="text-xs text-subtle">
          <summary className="cursor-pointer hover:text-muted">💡 如何获取坐标？</summary>
          <div className="mt-2 rounded-lg bg-surface p-3 leading-relaxed">
            <p>1. 打开 <a href="https://lbs.amap.com/tools/picker" target="_blank" rel="noopener noreferrer" className="text-pine">高德坐标拾取</a></p>
            <p>2. 搜索地点名，点击获取经纬度</p>
            <p>3. 日志用 <code className="bg-white px-1 rounded">[纬度, 经度]</code> 格式</p>
            <p>4. 路线用 <code className="bg-white px-1 rounded">[[纬度, 经度], [纬度, 经度]]</code> 格式</p>
          </div>
        </details>
      </div>
    </div>
  )
}
