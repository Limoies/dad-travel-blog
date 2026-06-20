'use client'

import dynamic from 'next/dynamic'

export default dynamic(() => import('./RouteDetailMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-white">
      <span className="text-xs text-subtle">🗺️ 加载中...</span>
    </div>
  ),
})
