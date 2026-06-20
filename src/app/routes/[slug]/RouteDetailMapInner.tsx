'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import type { Route, Post } from '@/types'

const startIcon = L.divIcon({
  className: '', html: '<div style="background:#2d6a4f;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)"></div>',
  iconSize: [16, 16], iconAnchor: [8, 8],
})

const endIcon = L.divIcon({
  className: '', html: '<div style="background:#18181b;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.15)"></div>',
  iconSize: [12, 12], iconAnchor: [6, 6],
})

const postIcon = L.divIcon({
  className: '', html: '<div style="background:white;width:10px;height:10px;border-radius:50%;border:2px solid #2d6a4f;box-shadow:0 1px 4px rgba(0,0,0,0.1)"></div>',
  iconSize: [10, 10], iconAnchor: [5, 5],
})

interface Props { route: Route; posts?: Post[] }

export default function RouteDetailMapInner({ route, posts = [] }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-white"><span className="text-xs text-subtle">加载地图...</span></div>

  const coords = route.coordinates
  if (coords.length < 2) return <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-white"><span className="text-xs text-subtle">坐标数据不足</span></div>

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl border border-border">
      <MapContainer bounds={L.latLngBounds(coords)} boundsOptions={{ padding: [40, 40] }} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer attribution='&copy; 高德地图' url="https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}" />
        <Polyline positions={coords} pathOptions={{ color: '#2d6a4f', weight: 3, opacity: 0.5 }} />

        <Marker position={coords[0]} icon={startIcon}>
          <Popup><span className="text-xs">起点</span></Popup>
        </Marker>
        <Marker position={coords[coords.length - 1]} icon={endIcon}>
          <Popup><span className="text-xs">终点</span></Popup>
        </Marker>

        {/* 日志标记 — 使用 Popup 才能点击跳转 */}
        {posts.filter(p => p.coordinates).map(p => (
          <Marker key={p.slug} position={p.coordinates!} icon={postIcon}>
            <Popup closeOnClick={false} autoClose={false} closeButton={true}>
              <div className="text-center min-w-[100px]">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-[#71717a]">{p.location} · {p.date}</p>
                <Link href={`/posts/${p.slug}`}
                  style={{ color: '#fff', backgroundColor: '#18181b' }}
                  className="mt-1 inline-block rounded px-3 py-1 text-xs hover:opacity-80">
                  查看日志 →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
