import { NextResponse } from 'next/server'

// GitHub 配置（从环境变量读取）
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO || '苏泽/dad-travel-blog'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, slug, content } = body

    // 参数校验
    if (!type || !slug || !content) {
      return NextResponse.json({ success: false, error: '缺少必要参数（type, slug, content）' }, { status: 400 })
    }
    if (!['post', 'route'].includes(type)) {
      return NextResponse.json({ success: false, error: 'type 必须是 post 或 route' }, { status: 400 })
    }

    // 构建文件路径
    const dir = type === 'post' ? 'content/posts' : 'content/routes'
    const filePath = `${dir}/${slug}.md`

    // 没有配置 Token → 返回 Markdown 内容让用户手动复制
    if (!GITHUB_TOKEN || GITHUB_TOKEN === '') {
      return NextResponse.json({
        success: false,
        needManualCopy: true,
        filePath,
        content,
        message: '未配置 GitHub Token，请手动复制下方内容到仓库中',
      })
    }

    // 通过 GitHub API 获取文件当前 SHA（如果是更新已有文件）
    let sha: string | undefined
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`
    try {
      const getRes = await fetch(getUrl, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      if (getRes.ok) {
        const data = await getRes.json()
        sha = data.sha
      }
    } catch { /* 文件不存在 → 新建 */ }

    // 提交到 GitHub
    const putUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`
    const putBody: any = {
      message: `feat: ${type === 'post' ? '新增日志' : '新增路线'} - ${slug}`,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: GITHUB_BRANCH,
    }
    if (sha) putBody.sha = sha

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    })

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}))
      return NextResponse.json({
        success: false,
        error: `GitHub API 错误: ${putRes.status}`,
        detail: errData,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '保存成功！Vercel 将在几秒后自动部署更新 🚀',
      filePath,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
