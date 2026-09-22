# LeadForge Maps Scraper — Vercel Container

Serviço HTTP stateless para o LeadForge usando a imagem oficial `gosom/google-maps-scraper`.

## Deploy na Vercel

Importe o repositório `theuskkj/leadforge-pro` como um novo projeto e defina:

- **Root Directory:** `scraper-vercel`
- **Framework Preset:** Other
- O arquivo `Dockerfile.vercel` será usado como container runtime.

Crie uma variável de ambiente sensível:

```
SCRAPER_SHARED_SECRET=<gere-um-segredo-longo-e-aleatorio>
```

Opcional:

```
SCRAPER_TIMEOUT_SECONDS=165
```

## Endpoints

### Health

```
GET /health
```

### Pesquisa

```
POST /scrape
X-API-Key: <SCRAPER_SHARED_SECRET>
Content-Type: application/json

{
  "country": "Brasil",
  "location": "São Paulo SP",
  "niche": "dentistas",
  "limit": 20,
  "minRating": 4
}
```

O serviço executa uma pesquisa real por requisição e devolve os resultados diretamente. Ele não usa mocks nem depende de arquivos persistentes entre requisições.
