export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-xs text-subtle tracking-wide">
          用方向盘丈量大地 · 用镜头定格风景
        </p>
        <p className="mt-2 text-xs text-subtle/50">
          &copy; {new Date().getFullYear()} 老爸自驾日志
        </p>
      </div>
    </footer>
  )
}
