import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO || 'Limoies/dad-travel-blog'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { filePath, content, message } = body
    if (!filePath || !content) {
      return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: false, needManualCopy: true, message: '未配置Token，请手动上传' })
    }

    // 获取文件 SHA（如果已存在）
    let sha: string | undefined
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`
    try {
      const res = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
      })
      if (res.ok) { const d = await res.json(); sha = d.sha }
    } catch {}

    // 上传文件
    const putUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message || `上传照片: ${filePath}`,
        content,
        branch: GITHUB_BRANCH,
        sha,
      }),
    })

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}))
      return NextResponse.json({ success: false, error: `上传失败: ${putRes.status}` }, { status: 500 })
    }

    // 返回可访问的图片 URL
    const imgUrl = `/${filePath.replace(/^public\//, '')}`
    return NextResponse.json({
      success: true,
      message: `✅ 上传成功！可在正文中用 \`![描述](${imgUrl})\` 插入`,
      url: imgUrl,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
