type ApiRequest = {
  method?: string
  body?: unknown
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

type GooglePlace = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  primaryTypeDisplayName?: { text?: string }
  googleMapsLinks?: { placeUri?: string }
  location?: { latitude?: number; longitude?: number }
}

type GoogleResponse = {
  places?: GooglePlace[]
  nextPageToken?: string
  error?: { message?: string; status?: string }
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'places.googleMapsLinks',
  'places.location',
  'nextPageToken',
].join(',')

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

function cleanString(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (req.method === 'GET') {
    res.status(200).json({ configured: Boolean(apiKey), provider: 'google-places' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  if (!apiKey) {
    res.status(503).json({ error: 'Google Places não configurado no servidor', configured: false })
    return
  }

  const body = parseBody(req.body)
  const country = cleanString(body.country, 80) || 'Brasil'
  const location = cleanString(body.location, 120)
  const niche = cleanString(body.niche, 100)
  const requestedLimit = Number(body.limit)
  const limit = Number.isFinite(requestedLimit) ? Math.min(20, Math.max(1, Math.round(requestedLimit))) : 20
  const requestedMinRating = Number(body.minRating)
  const minRating = Number.isFinite(requestedMinRating) && requestedMinRating > 0
    ? Math.min(5, Math.max(0, requestedMinRating))
    : undefined

  if (!location || !niche) {
    res.status(400).json({ error: 'Informe localização e nicho para pesquisar.' })
    return
  }

  const requestBody: Record<string, unknown> = {
    textQuery: `${niche} em ${location}, ${country}`,
    languageCode: 'pt-BR',
    pageSize: limit,
  }

  if (country.toLowerCase().includes('brasil') || country.toLowerCase().includes('brazil')) {
    requestBody.regionCode = 'BR'
  }
  if (minRating !== undefined) requestBody.minRating = minRating

  try {
    const googleResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(requestBody),
    })

    const payload = (await googleResponse.json()) as GoogleResponse

    if (!googleResponse.ok) {
      res.status(googleResponse.status >= 400 && googleResponse.status < 500 ? 400 : 502).json({
        error: payload.error?.message || 'Falha ao consultar o Google Places.',
      })
      return
    }

    res.status(200).json({
      places: payload.places ?? [],
      nextPageToken: payload.nextPageToken,
      source: 'google',
    })
  } catch {
    res.status(502).json({ error: 'Não foi possível conectar ao Google Places.' })
  }
}
