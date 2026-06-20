'use client'

import dynamic from 'next/dynamic'
import type { RouteSummary } from '@/types'

// 关键：动态导入 + ssr: false → 避免 Leaflet 在服务端报 "window is not defined"
const RouteMapClient = dynamic(
  () => import('./RouteMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl bg-stone-100 lg:h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">🗺️</span>
          <span className="text-sm text-stone-400">地图加载中...</span>
        </div>
      </div>
    ),
  }
)

interface RouteMapProps {
  routes: RouteSummary[]
  focusRoute?: string
}

export default function RouteMap({ routes, focusRoute }: RouteMapProps) {
  return <RouteMapClient routes={routes} focusRoute={focusRoute} />
}
