'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, Popup, useMap } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'
import L from 'leaflet'
import Link from 'next/link'
import type { RouteSummary } from '@/types'

const startIcon = L.divIcon({
  className: '',
  html: '<div style="background:#2d6a4f;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7],
})

function FitBounds({ routes }: { routes: RouteSummary[] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current) return
    fitted.current = true
    const coords: [number, number][] = []
    routes.forEach(r => { if (r.startPoint) coords.push(r.startPoint) })
    if (coords.length > 0) map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 6 })
  }, [routes, map])
  return null
}

function DefaultView() {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    setTimeout(() => map.invalidateSize(), 100)
  }, [map])
  return null
}

interface Props { routes: RouteSummary[] }

export default function RouteMapClient({ routes }: Props) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  if (!ready) {
    return (
      <div style={{ height: '500px', width: '100%' }} className="flex items-center justify-center rounded-xl bg-[#f0f0ee]">
        <span className="text-xs text-[#a1a1aa]">加载地图中...</span>
      </div>
    )
  }

  const demoRoute: [number, number][] = [
    [30.57, 104.07], [30.05, 101.96], [30.00, 99.10],
    [29.65, 97.83], [29.66, 97.46], [29.27, 94.86], [29.65, 91.13],
  ]

  return (
    <div style={{ height: '500px', width: '100%' }} className="overflow-hidden rounded-xl">
      <MapContainer center={[34, 100]} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} zoomControl={true}>
        <TileLayer attribution='&copy; 高德地图' url="https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}" />
        {routes.length === 0 ? <DefaultView /> : <FitBounds routes={routes} />}

        {/* 演示路线 */}
        {routes.length === 0 && (
          <>
            <Polyline positions={demoRoute} pathOptions={{ color: '#2d6a4f', weight: 4, opacity: 0.6 }} />
            <Marker position={demoRoute[0]} icon={startIcon}>
              <Tooltip permanent direction="top" offset={[0, -10]}><span className="text-xs">成都 · 起点</span></Tooltip>
            </Marker>
            <Marker position={demoRoute[demoRoute.length - 1]} icon={startIcon}>
              <Tooltip permanent direction="top" offset={[0, -10]}><span className="text-xs">拉萨 · 终点</span></Tooltip>
            </Marker>
          </>
        )}

        {/* 真实路线 → 用 Popup 才能点击 */}
        {routes.map(route =>
          route.startPoint ? (
            <Marker key={route.slug} position={route.startPoint} icon={startIcon}>
              <Popup closeOnClick={false} autoClose={false} closeButton={true}>
                <div className="text-center min-w-[90px]">
                  <p className="text-sm font-medium">{route.title}</p>
                  <p className="text-xs text-[#71717a]">{route.postCount} 篇日志</p>
                  <Link href={`/routes/${route.slug}`}
                    style={{ color: '#fff', backgroundColor: '#18181b' }}
                    className="mt-1.5 inline-block rounded px-3 py-1 text-xs hover:opacity-80">
                    查看路线 →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  )
}
