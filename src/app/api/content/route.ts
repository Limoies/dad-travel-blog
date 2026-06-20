import { NextResponse } from 'next/server'
import { getAllPosts, getRoutesWithPostCount } from '@/lib/posts'

export async function GET() {
  const posts = getAllPosts()
  const routes = getRoutesWithPostCount()

  return NextResponse.json({
    posts: posts.map(p => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      location: p.location,
      route: p.route,
      tags: p.tags,
    })),
    routes: routes.map(r => ({
      slug: r.slug,
      title: r.title,
      date: r.date,
      description: r.description,
      postCount: r.postCount,
    })),
  })
}
