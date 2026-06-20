'use client'

import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''

export default function AdminPage() {
  // 所有 hooks 都在顶层声明
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 恢复登录状态
  useEffect(() => {
    const saved = localStorage.getItem('admin_logged_in')
    if (saved === 'true') {
      setLoggedIn(true)
    }
  }, [])

  // 登录后加载数据
  useEffect(() => {
    if (!loggedIn) return
    setLoading(true)
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        setPosts(data.posts || [])
        setRoutes(data.routes || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [loggedIn])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true)
      setError('')
      localStorage.setItem('admin_logged_in', 'true')
    } else {
      setError('密码错误')
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setPassword('')
    setPosts([])
    setRoutes([])
    localStorage.removeItem('admin_logged_in')
  }

  // ===== 登录页 =====
  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-sm px-4 pt-24">
        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pine text-white text-lg font-bold">D</div>
            <h1 className="text-lg font-semibold text-foreground">管理后台</h1>
            <p className="mt-1 text-xs text-muted">输入密码进入管理面板</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder={ADMIN_PASSWORD === '' ? '密码为空，直接登录' : '输入密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus:border-pine/40 focus:ring-1 focus:ring-pine/20 transition-all"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleLogin}
              className="w-full rounded-lg bg-pine py-2.5 text-sm font-medium text-white hover:bg-pine/90 transition-colors">
              进入管理
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 管理面板 =====
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">📋 管理后台</h1>
          <p className="text-xs text-muted mt-0.5">管理旅行路线和日志</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.href = '/admin/new'}
            className="rounded-lg bg-pine px-4 py-2 text-xs font-medium text-white hover:bg-pine/90 transition-colors">
            ✍️ 写日志
          </button>
          <button onClick={handleLogout}
            className="rounded-lg border border-border bg-white px-4 py-2 text-xs text-muted hover:text-foreground transition-colors">
            退出
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs text-muted">加载中...</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 路线 */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">📍 路线管理</h2>
            {routes.length === 0 ? (
              <p className="text-xs text-subtle py-8 text-center">暂无路线</p>
            ) : (
              <div className="space-y-2">
                {routes.map((route: any) => (
                  <div key={route.slug} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{route.title}</p>
                      <p className="text-xs text-muted">{route.postCount || 0} 篇日志 · {route.date}</p>
                    </div>
                    <span className="text-xs text-subtle ml-2 shrink-0">{route.slug}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-subtle text-center">
              编辑功能开发中，可在 <code className="bg-surface px-1 rounded text-pine">content/routes/</code> 编辑 Markdown
            </p>
          </div>

          {/* 日志 */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">📝 日志管理</h2>
            {posts.length === 0 ? (
              <p className="text-xs text-subtle py-8 text-center">暂无日志</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {posts.map((post: any) => (
                  <div key={post.slug} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-xs text-muted">{post.location} · {post.date}</p>
                    </div>
                    <span className="text-xs text-subtle ml-2 shrink-0">{post.slug}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-subtle text-center">
              编辑功能开发中，可在 <code className="bg-surface px-1 rounded text-pine">content/posts/</code> 编辑 Markdown
            </p>
          </div>
        </div>
      )}

      {/* 编辑指南 */}
      <div className="mt-8 rounded-xl border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">📖 如何添加路线和日志</h2>
        <div className="space-y-5 text-xs text-muted">
          {/* 第一步 */}
          <div>
            <p className="font-medium text-foreground mb-1">📍 第一步：创建路线</p>
            <p>在 <code className="bg-surface px-1 rounded text-pine">content/routes/</code> 里新建 <code className="bg-surface px-1 rounded">.md</code> 文件，例如 <code className="bg-surface px-1 rounded">yunnan.md</code></p>
            <details className="mt-2">
              <summary className="text-pine cursor-pointer">查看路线模板</summary>
              <pre className="mt-1 rounded-lg bg-surface p-3 overflow-x-auto text-xs text-muted">{`---
title: "云南自驾"
date: "2025-08"
description: "路线描述"
color: "#e74c3c"
coordinates:
  - [25.04, 102.68]   # 昆明
  - [25.12, 102.74]   # 下一个点
  - [24.34, 102.54]   # 再下一个...
tags: ["云南", "自驾"]
---
路线简介...`}</pre>
            </details>
          </div>

          {/* 第二步 */}
          <div>
            <p className="font-medium text-foreground mb-1">🗺️ 如何获取坐标</p>
            <p>打开 <a href="https://lbs.amap.com/tools/picker" target="_blank" rel="noopener noreferrer" className="text-pine underline">高德坐标拾取</a>，搜索地点名，点击就能看到经纬度</p>
            <p className="mt-1">复制纬度、经度，按 <code className="bg-surface px-1 rounded">[纬度, 经度]</code> 的格式写到 <code className="bg-surface px-1 rounded">coordinates</code> 里</p>
          </div>

          {/* 第三步 */}
          <div>
            <p className="font-medium text-foreground mb-1">📝 第三步：创建日志</p>
            <p>在 <code className="bg-surface px-1 rounded text-pine">content/posts/</code> 里新建 <code className="bg-surface px-1 rounded">.md</code> 文件</p>
            <p className="mt-1">文件名建议格式：<code className="bg-surface px-1 rounded">2025-08-15-kunming.md</code>（日期-地点）</p>
            <details className="mt-2">
              <summary className="text-pine cursor-pointer">查看日志模板</summary>
              <pre className="mt-1 rounded-lg bg-surface p-3 overflow-x-auto text-xs text-muted">{`---
title: "昆明一日游"
date: "2025-08-15"
route: "yunnan"          # 对应路线的slug（文件名）
location: "昆明"
coordinates: [25.04, 102.68]
tags: ["云南", "昆明"]
cover: "/images/yunnan/kunming.jpg"
---

## 正文标题

写日志内容，支持 Markdown 格式

![图片描述](/images/yunnan/kunming.jpg)`}</pre>
            </details>
          </div>

          {/* 第四步 */}
          <div>
            <p className="font-medium text-foreground mb-1">📸 第四步：放照片</p>
            <p>照片放在 <code className="bg-surface px-1 rounded text-pine">public/images/路线名/</code> 下</p>
            <p className="mt-1">比如云南的照片 → <code className="bg-surface px-1 rounded">public/images/yunnan/</code></p>
            <p className="mt-1">在 Markdown 中引用：<code className="bg-surface px-1 rounded">![描述](/images/yunnan/kunming.jpg)</code></p>
          </div>

          {/* 第五步 */}
          <div>
            <p className="font-medium text-foreground mb-1">🚀 第五步：部署上线</p>
            <p>把改动的文件提交到 GitHub，Vercel 会自动部署更新~</p>
            <pre className="mt-1 rounded-lg bg-surface p-3 text-xs text-muted">git add .
git commit -m "新增云南路线"
git push</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
