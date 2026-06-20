'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get('edit')
  const editType = searchParams.get('type') || 'post'

  const [loggedIn, setLoggedIn] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [type, setType] = useState<'post' | 'route'>(editType as any)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState(editSlug || '')
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

  // 编辑模式：加载已有内容
  useEffect(() => {
    if (!editSlug || !loggedIn) return
    setLoading(true)
    fetch(`/api/content/file?type=${editType}&slug=${editSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTitle(data.data.title || '')
          setDate(data.data.date || '')
          setRoute(data.data.route || '')
          setLocation(data.data.location || '')
          if (data.data.coordinates) {
            setCoordinates(JSON.stringify(data.data.coordinates))
          }
          if (data.data.tags) {
            setTags((data.data.tags as string[]).join(', '))
          }
          setContent(data.content || '')
        }
      })
      .finally(() => setLoading(false))
  }, [editSlug, editType, loggedIn])

  const generateSlug = (val: string) => {
    return val.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editSlug && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(val))
    }
  }

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
      } catch {}
    }
    if (tags) {
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)
      if (tagArr.length > 0) md += `tags: [${tagArr.map(t => `"${t}"`).join(', ')}]\n`
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
      if (data.needManualCopy) setResult({ ...data, content: md })
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!slug) return
    if (!confirm(`确定要删除「${title}」吗？此操作不可撤销！`)) return
    setSaving(true)
    try {
      const res = await fetch('/api/content/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slug }),
      })
      const data = await res.json()
      if (data.success) {
        alert('已删除！Vercel 将自动重新部署')
        router.push('/admin')
      } else {
        alert('删除失败：' + (data.error || '未知错误'))
      }
    } catch (err: any) {
      alert('删除失败：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!loggedIn) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{editSlug ? '✏️ 编辑' : '✍️ 写日志'}</h1>
          <p className="text-xs text-muted mt-0.5">{editSlug ? `编辑：${editSlug}` : '写下旅途中的故事'}</p>
        </div>
        <div className="flex gap-2">
          {editSlug && (
            <button onClick={handleDelete} disabled={saving}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 hover:bg-red-100 transition-colors">
              删除
            </button>
          )}
          <button onClick={() => router.push('/admin')}
            className="rounded-lg border border-border bg-white px-4 py-2 text-xs text-muted hover:text-foreground transition-colors">
            ← 返回
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-muted">加载中...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['post', 'route'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  type === t ? 'bg-pine text-white' : 'bg-surface text-muted hover:text-foreground'
                }`}>
                {t === 'post' ? '📝 日志' : '📍 路线'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">标题 *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="例：吐鲁番一日游"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
          </div>

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

          <div>
            <label className="text-xs text-muted mb-1 block">
              坐标 {type === 'post' ? '（如 [43.82, 87.62]）' : '（如 [[43.82, 87.62], [42.95, 89.18]]）'}
            </label>
            <input value={coordinates} onChange={e => setCoordinates(e.target.value)}
              placeholder={type === 'post' ? '[纬度, 经度]' : '[[纬度, 经度], [纬度, 经度]]'}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">标签（逗号分隔）</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="新疆, 吐鲁番, 自驾"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">正文（支持 Markdown）</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder={`## 标题\n\n写你的旅行故事...`}
              rows={10}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all resize-y font-mono" />
          </div>

          <button onClick={handleSave} disabled={saving || !title}
            className="w-full rounded-lg bg-pine py-3 text-sm font-medium text-white hover:bg-pine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {saving ? '保存中...' : '💾 保存并发布'}
          </button>

          {result && (
            <div className={`rounded-xl border p-4 text-sm ${
              result.success ? 'border-pine/20 bg-pine-light text-pine' :
              result.needManualCopy ? 'border-amber-200 bg-amber-50 text-amber-800' :
              'border-red-200 bg-red-50 text-red-700'
            }`}>
              <p>{result.message || (result.success ? '✅ 保存成功！' : '❌ 保存失败')}</p>
              {result.needManualCopy && result.content && (
                <div className="mt-3">
                  <p className="text-xs mb-2">请复制到 GitHub：</p>
                  <textarea readOnly value={result.content} rows={8}
                    className="w-full rounded-lg border border-amber-200 bg-white p-3 text-xs font-mono text-amber-900" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
