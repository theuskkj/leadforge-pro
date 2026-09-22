type ApiRequest = {
  method?: string
  body?: unknown
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseBody(body: unknown): Record<string, unknown> {
  if (isRecord(body)) return body
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body)
      return isRecord(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

function config() {
  return {
    url: process.env.GMAPS_SCRAPER_URL?.trim().replace(/\/$/, ''),
    key: process.env.GMAPS_SCRAPER_API_KEY?.trim(),
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const { url, key } = config()

  if (req.method === 'GET') {
    if (!url || !key) {
      res.status(200).json({ configured: false, provider: 'gosom' })
      return
    }

    try {
      const response = await fetch(`${url}/health`, {
        headers: { 'X-API-Key': key },
      })
      const payload = await response.json().catch(() => ({}))
      res.status(200).json({
        configured: response.ok && Boolean((payload as { ok?: boolean }).ok),
        provider: 'gosom',
      })
    } catch {
      res.status(200).json({ configured: false, provider: 'gosom' })
    }
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  if (!url || !key) {
    res.status(503).json({ error: 'Google Maps Scraper não configurado no servidor.' })
    return
  }

  const body = parseBody(req.body)

  try {
    const response = await fetch(`${url}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(body),
    })

    const payload = await response.json().catch(() => ({ error: 'Resposta inválida do scraper.' }))
    res.status(response.status).json(payload)
  } catch {
    res.status(502).json({ error: 'Não foi possível conectar ao Google Maps Scraper.' })
  }
}
