import { Router, type Request, type Response } from 'express'

const router = Router()

const GITHUB_API_BASE = 'https://api.github.com'

function getGithubToken(req: Request) {
  const headerToken = req.header('x-github-token')?.trim()
  if (headerToken) return headerToken
  return null
}

function buildGithubHeaders(req: Request) {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'dress-tracker',
  }

  const apiVersion = req.header('x-github-api-version')?.trim()
  headers['x-github-api-version'] = apiVersion || '2022-11-28'

  const token = getGithubToken(req)
  if (token) headers.authorization = `Bearer ${token}`

  const ifNoneMatch = req.header('if-none-match')
  if (ifNoneMatch) headers['if-none-match'] = ifNoneMatch

  return headers
}

router.all('/rest/*', async (req: Request, res: Response) => {
  try {
    const upstreamPath = req.params[0] ? `/${req.params[0]}` : ''
    const upstreamUrl = new URL(`${GITHUB_API_BASE}${upstreamPath}`)
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === 'string') upstreamUrl.searchParams.set(k, v)
      else if (Array.isArray(v)) v.forEach((vv) => upstreamUrl.searchParams.append(k, String(vv)))
      else if (v != null) upstreamUrl.searchParams.set(k, String(v))
    }

    const body =
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {})

    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: buildGithubHeaders(req),
      body,
    })

    const etag = upstreamRes.headers.get('etag')
    if (etag) res.setHeader('etag', etag)

    res.status(upstreamRes.status)

    const contentType = upstreamRes.headers.get('content-type') || 'application/json; charset=utf-8'
    res.setHeader('content-type', contentType)

    const text = await upstreamRes.text()
    res.send(text)
  } catch {
    res.status(502).json({ success: false, error: 'Bad gateway' })
  }
})

router.post('/graphql', async (req: Request, res: Response) => {
  try {
    const upstreamRes = await fetch(`${GITHUB_API_BASE}/graphql`, {
      method: 'POST',
      headers: {
        ...buildGithubHeaders(req),
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body ?? {}),
    })

    const etag = upstreamRes.headers.get('etag')
    if (etag) res.setHeader('etag', etag)

    res.status(upstreamRes.status)
    res.setHeader('content-type', upstreamRes.headers.get('content-type') || 'application/json; charset=utf-8')

    const text = await upstreamRes.text()
    res.send(text)
  } catch {
    res.status(502).json({ success: false, error: 'Bad gateway' })
  }
})

export default router

