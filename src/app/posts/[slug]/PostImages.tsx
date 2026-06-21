'use client'

import { useState } from 'react'

interface Props { images: string[] }

export default function PostImages({ images }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  if (images.length === 0) return null

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setSelected(src)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f0f0ee] transition-all hover:shadow-md"
          >
            {errors.has(src) ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl text-[#d4d4d8]">📷</span>
              </div>
            ) : (
              <img
                src={src}
                alt={`照片 ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setErrors(prev => new Set(prev).add(src))}
              />
            )}
          </button>
        ))}
      </div>

      {/* 大图预览 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-3xl w-full max-h-[80vh] rounded-xl bg-white p-2 shadow-xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            {errors.has(selected) ? (
              <div className="aspect-video flex items-center justify-center bg-[#f0f0ee] rounded-lg">
                <span className="text-4xl text-[#d4d4d8]">📷</span>
              </div>
            ) : (
              <img
                src={selected}
                alt="大图"
                className="w-full max-h-[75vh] object-contain rounded-lg"
                onError={() => setErrors(prev => new Set(prev).add(selected))}
              />
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-2 w-full rounded-lg bg-surface py-2 text-xs text-muted hover:bg-border transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  )
}
