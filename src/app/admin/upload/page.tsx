'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [routeName, setRouteName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('admin_logged_in')
    if (saved !== 'true') router.push('/admin')
    else setLoggedIn(true)
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)

    try {
      // 读取文件为 base64
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      const base64 = btoa(binary)

      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const dir = routeName ? `images/${routeName}` : 'images'
      const filePath = `public/${dir}/${fileName}`

      // 通过 GitHub API 上传
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''

      // 先调我们的 API 获取仓库信息
      const res = await fetch('/api/content/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content: base64, message: `上传照片: ${fileName}` }),
      })
      const data = await res.json()
      setResult(data)
      if (data.success) {
        setFile(null)
        setPreview('')
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setUploading(false)
    }
  }

  if (!loggedIn) return null

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">📸 上传照片</h1>
          <p className="text-xs text-muted mt-0.5">上传到网站，写日志时就能用了</p>
        </div>
        <button onClick={() => router.push('/admin')}
          className="rounded-lg border border-border bg-white px-4 py-2 text-xs text-muted hover:text-foreground transition-colors">
          ← 返回
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 space-y-4">
        {/* 路线文件夹 */}
        <div>
          <label className="text-xs text-muted mb-1 block">归类到路线（可选）</label>
          <input value={routeName} onChange={e => setRouteName(e.target.value)}
            placeholder="如 turpan，留空放 images/ 根目录"
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 transition-all" />
        </div>

        {/* 选择文件 */}
        <div>
          <label className="text-xs text-muted mb-1 block">选择照片</label>
          <input type="file" accept="image/*" onChange={handleFileChange}
            className="w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-pine file:px-3 file:py-1.5 file:text-xs file:text-white file:cursor-pointer hover:file:bg-pine/90" />
        </div>

        {/* 预览 */}
        {preview && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={preview} alt="预览" className="w-full max-h-64 object-contain" />
            <p className="px-3 py-1.5 text-xs text-muted bg-surface">{file?.name}</p>
          </div>
        )}

        {/* 上传按钮 */}
        <button onClick={handleUpload} disabled={!file || uploading}
          className="w-full rounded-lg bg-pine py-2.5 text-sm font-medium text-white hover:bg-pine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {uploading ? '上传中...' : '📤 上传到网站'}
        </button>

        {result && (
          <div className={`rounded-xl border p-3 text-sm ${
            result.success ? 'border-pine/20 bg-pine-light text-pine' : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {result.message || (result.success ? '✅ 上传成功！可在写日志时插入' : '❌ 上传失败')}
          </div>
        )}
      </div>
    </div>
  )
}
