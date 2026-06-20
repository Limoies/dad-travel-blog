'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) return <div className="w-7 h-7" />

  return (
    <button
      onClick={toggle}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-muted hover:bg-surface hover:text-foreground transition-all"
      title={dark ? '切换亮色' : '切换暗色'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
