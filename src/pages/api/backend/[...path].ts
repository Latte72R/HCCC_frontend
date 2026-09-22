import type { NextApiRequest, NextApiResponse } from 'next'

/** Same-origin API gateway for local development and container deployments. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = req.query.path
  if (!Array.isArray(path) || path[0] !== 'api' || path.some((part) => !/^[\w-]+$/.test(part))) {
    res.status(400).json({ status: 'ng', errorMessage: 'Invalid path' })
    return
  }

  const baseUrl = process.env.HCCC_API_INTERNAL_URL || 'http://localhost:55301'
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path' || value === undefined) continue
    for (const item of Array.isArray(value) ? value : [value]) query.append(key, item)
  }
  const url = `${baseUrl.replace(/\/$/, '')}/${path.join('/')}${query.size ? `?${query}` : ''}`

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
        ...(req.headers['content-type'] ? { 'content-type': req.headers['content-type'] } : {}),
      },
      body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body),
    })
    const cookie = upstream.headers.get('set-cookie')
    if (cookie) res.setHeader('Set-Cookie', cookie)
    res.setHeader('Cache-Control', 'no-store')
    res.status(upstream.status)
    const text = await upstream.text()
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    res.send(text)
  } catch {
    res.status(502).json({ status: 'ng', errorMessage: 'Backend unavailable' })
  }
}
