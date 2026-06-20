import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getPostBySlug, getAllPosts } from "@/lib/posts"

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()
  const all = getAllPosts()
  const ci = all.findIndex(p => p.slug === slug)
  const prev = ci < all.length - 1 ? all[ci + 1] : null
  const next = ci > 0 ? all[ci - 1] : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-8 flex items-center gap-2 text-xs text-subtle">
        <Link href="/" className="hover:text-foreground">首页</Link><span className="text-border">/</span>
        <Link href={`/routes/${post.route}`} className="hover:text-foreground">{post.route}</Link><span className="text-border">/</span>
        <span className="text-muted">{post.title}</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs text-subtle tracking-wider mb-2">JOURNAL</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{post.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{post.date}</span><span className="text-border">·</span><span>{post.location}</span>
          {post.coordinates && <><span className="text-border">·</span><span>{post.coordinates[0].toFixed(3)}°N</span></>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map(t => <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">#{t}</span>)}
          </div>
        )}
      </header>

      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <nav className="mt-16 flex items-center justify-between border-t border-border pt-8">
        <div>{prev ? <Link href={`/posts/${prev.slug}`} className="group flex flex-col text-left"><span className="text-xs text-subtle">← 上一篇</span><span className="text-sm text-muted group-hover:text-foreground transition-colors">{prev.title}</span></Link> : <span />}</div>
        <div>{next ? <Link href={`/posts/${next.slug}`} className="group flex flex-col text-right"><span className="text-xs text-subtle">下一篇 →</span><span className="text-sm text-muted group-hover:text-foreground transition-colors">{next.title}</span></Link> : <span />}</div>
      </nav>
    </article>
  )
}
