import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO || 'Limoies/dad-travel-blog'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, slug } = body
    if (!type || !slug) {
      return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
    }
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: '未配置 GitHub Token' }, { status: 400 })
    }

    const dir = type === 'post' ? 'content/posts' : 'content/routes'
    const filePath = `${dir}/${slug}.md`

    // 先获取文件 SHA
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    })
    if (!getRes.ok) {
      return NextResponse.json({ success: false, error: '文件不存在' }, { status: 404 })
    }
    const fileData = await getRes.json()

    // 删除文件
    const delUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`
    const delRes = await fetch(delUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `delete: ${type === 'post' ? '删除日志' : '删除路线'} - ${slug}`,
        sha: fileData.sha,
        branch: GITHUB_BRANCH,
      }),
    })

    if (!delRes.ok) {
      return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '已删除 ✅' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
