type ApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  body?: unknown
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

type ScrapeJob = {
  job_id?: string
  status?: string
  keyword?: string
  error?: string
  result_count?: number
  results?: unknown
  message?: string
}

type ScraperEntry = {
  input_id?: string
  link?: string
  cid?: string
  title?: string
  category?: string
  address?: string
  web_site?: string
  phone?: string
  review_count?: number
  review_rating?: number
  latitude?: number
  longitude?: number
  longtitude?: number
  data_id?: string
  place_id?: string
  complete_address?: {
    city?: string
    state?: string
    country?: string
  }
  emails?: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function bodyAsRecord(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value)
      return isRecord(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

function clean(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function env() {
  const baseUrl = process.env.GMAPS_SCRAPER_URL?.trim().replace(/\/$/, '')
  const apiKey = process.env.GMAPS_SCRAPER_API_KEY?.trim()
  return { baseUrl, apiKey }
}

async function scraperFetch(path: string, init?: RequestInit) {
  const { baseUrl, apiKey } = env()
  if (!baseUrl || !apiKey) {
    throw new Error('Google Maps Scraper não configurado no servidor')
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...(init?.headers ?? {}),
    },
  })
}

function normalizeEntries(results: unknown) {
  if (!Array.isArray(results)) return []

  return results
    .filter((item): item is ScraperEntry => isRecord(item))
    .map((item) => ({
      id: item.place_id || item.data_id || item.cid || item.input_id || '',
      name: item.title || '',
      niche: item.category || '',
      city: item.complete_address?.city || '',
      address: item.address || '',
      phone: item.phone || '',
      website: item.web_site || '',
      rating: Number(item.review_rating || 0),
      reviewCount: Number(item.review_count || 0),
      googleMapsUrl: item.link || '',
      placeId: item.place_id || '',
      lat: typeof item.latitude === 'number' ? item.latitude : undefined,
      lng: typeof item.longitude === 'number'
        ? item.longitude
        : typeof item.longtitude === 'number'
          ? item.longtitude
          : undefined,
      emails: Array.isArray(item.emails) ? item.emails : [],
    }))
    .filter((item) => item.name)
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const { baseUrl, apiKey } = env()

  if (req.method === 'GET' && !req.query?.job_id) {
    if (!baseUrl || !apiKey) {
      res.status(200).json({ configured: false, provider: 'gosom' })
      return
    }

    try {
      const response = await scraperFetch('/api/v1/health')
      res.status(200).json({
        configured: response.ok,
        provider: 'gosom',
      })
    } catch {
      res.status(200).json({ configured: false, provider: 'gosom' })
    }
    return
  }

  if (req.method === 'POST') {
    const body = bodyAsRecord(req.body)
    const country = clean(body.country, 80) || 'Brasil'
    const location = clean(body.location, 120)
    const niche = clean(body.niche, 100)
    const requestedLimit = Number(body.limit)
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(50, Math.max(1, Math.round(requestedLimit)))
      : 20

    if (!location || !niche) {
      res.status(400).json({ error: 'Informe localização e nicho para pesquisar.' })
      return
    }

    if (!baseUrl || !apiKey) {
      res.status(503).json({ error: 'Google Maps Scraper não configurado no servidor.' })
      return
    }

    const keyword = `${niche} em ${location}, ${country}`

    try {
      const response = await scraperFetch('/api/v1/scrape', {
        method: 'POST',
        body: JSON.stringify({
          keyword,
          lang: 'pt-BR',
          max_depth: Math.max(1, Math.ceil(limit / 20)),
          email: false,
          extra_reviews: false,
          timeout: 240,
        }),
      })

      const payload = (await response.json()) as ScrapeJob
      if (!response.ok || !payload.job_id) {
        res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
          error: payload.message || payload.error || 'Não foi possível iniciar a pesquisa no Google Maps.',
        })
        return
      }

      res.status(202).json({
        jobId: payload.job_id,
        status: payload.status || 'pending',
        keyword,
      })
    } catch (error) {
      res.status(502).json({
        error: error instanceof Error ? error.message : 'Falha ao conectar ao Google Maps Scraper.',
      })
    }
    return
  }

  if (req.method === 'GET' && req.query?.job_id) {
    const rawJobId = req.query.job_id
    const jobId = clean(Array.isArray(rawJobId) ? rawJobId[0] : rawJobId, 160)

    if (!jobId) {
      res.status(400).json({ error: 'job_id inválido.' })
      return
    }

    try {
      const response = await scraperFetch(`/api/v1/jobs/${encodeURIComponent(jobId)}`)
      const payload = (await response.json()) as ScrapeJob

      if (!response.ok) {
        res.status(response.status === 404 ? 404 : 502).json({
          error: payload.message || payload.error || 'Não foi possível consultar a pesquisa.',
        })
        return
      }

      res.status(200).json({
        jobId: payload.job_id || jobId,
        status: payload.status || 'pending',
        error: payload.error || '',
        resultCount: Number(payload.result_count || 0),
        results: payload.status === 'completed' ? normalizeEntries(payload.results) : [],
      })
    } catch (error) {
      res.status(502).json({
        error: error instanceof Error ? error.message : 'Falha ao consultar o Google Maps Scraper.',
      })
    }
    return
  }

  res.status(405).json({ error: 'Método não permitido.' })
}
