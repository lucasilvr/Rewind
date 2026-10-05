# Integração com API de música (tarefa 4.1)

## Decisão

**Fonte escolhida: [Deezer API](https://developers.deezer.com/api)** (outubro de 2026).

Ela é a única das três opções avaliadas que oferece busca, capa, faixas e algo que sirva de "novidades" em uma só API, sem autenticação e sem custo.

## Comparação

| Critério | **Deezer** | MusicBrainz | Spotify |
|---|---|---|---|
| Gratuita | Sim, para uso **não comercial** | Sim (dados CC0) | Sim, mas desde fev/2026 o dono do app precisa de **Spotify Premium** |
| Autenticação | Nenhuma para dados públicos do catálogo | Nenhuma, mas exige `User-Agent` com contato | OAuth (client ID + client secret) |
| Limite de requisições | ~50 req a cada 5 s por IP (valor de referência; erro `code 4` quando excede) | 1 req/s por IP (503 quando excede) | Não divulgado; modo de desenvolvimento limitado a 5 usuários e 1 client ID por desenvolvedor |
| Capa de álbum | Sim (56px a 1000px, CDN própria) | Só via [Cover Art Archive](https://coverartarchive.org), nem todo lançamento tem | Sim |
| Lista de faixas | Sim, com número do disco | Sim, mas é preciso escolher uma edição específica (release) | Sim (`GET /albums/{id}` continua disponível) |
| Busca | Álbuns e artistas | Sim (Lucene), com muitas edições duplicadas | Sim, mas limitada a **10 resultados** por página desde fev/2026 |
| "Novidades" | `/editorial/0/releases` e `/editorial/0/selection` | Não tem; só filtro por data, sem relevância | `/browse/new-releases` **removido** em fev/2026 para apps em modo de desenvolvimento |

### Por que não as outras

- **Spotify:** em fevereiro de 2026 o modo de desenvolvimento passou a exigir Premium do dono do app. Também removeu o endpoint de novidades e reduziu a busca para no máximo 10 resultados. A [política de desenvolvedor](https://developer.spotify.com/policy) exige link de volta para o Spotify ao exibir metadados e capas e proíbe oferecer esses dados como produto independente. Isso conflita com o cache sob demanda no nosso banco.
- **MusicBrainz:** os dados são excelentes e abertos, mas o limite de 1 req/s, a capa em outra API e a falta de "novidades" deixariam as telas lentas e mais complexas.

## Termos de uso e restrições da Deezer

- [Termos de uso da API](https://developers.deezer.com/termsofuse): proíbem gerar receita direta ou indireta com os dados (seção IV) e exigem seguir as diretrizes de marca ao usar o nome ou logo da Deezer (seções II e VII). Um projeto acadêmico sem fins lucrativos atende.
- [Diretrizes](https://developers.deezer.com/guidelines): proíbem expor URLs de faixas completas e armazenar áudio. Não usamos áudio.
- Os termos não tratam de armazenamento de metadados. Nosso cache sob demanda guarda só título, artistas, faixas e URL da capa (não a imagem).
- Erros chegam com **HTTP 200** e corpo `{"error":{"code":...}}`. Códigos tratados: `4` (cota excedida), `700` (serviço ocupado), `800` (dado não encontrado). Lista completa: https://developers.deezer.com/api/errors

### Limitações observadas nos testes

- A busca (`/search/album`) **não informa o ano**. Nos resultados de busca, `releaseYear` vem `null`. Em "Novidades", o backend busca o detalhe de cada álbum para preencher o ano (no máximo 25 chamadas, guardadas em cache).
- `/editorial/0/releases` às vezes vem vazio. Nesse caso, usamos `/editorial/0/selection` (seleção editorial da Deezer).
- `/album/{id}` só embute as 25 primeiras faixas. Por isso as faixas vêm de `/album/{id}/tracks?limit=500`.
- Quando não há capa, a Deezer devolve uma URL quebrada (`.../images/cover//500x500...`). O provider converte isso em `coverUrl: null`.

## Como está organizado

```
backend/src/
  server.ts                       # registra as rotas de música e o middleware de erro
  routes/music.routes.ts          # rotas HTTP de música
  services/music/
    music.types.ts                # interface MusicProvider + DTOs (ExternalAlbum, ExternalArtist, ExternalTrack)
    music.provider.ts             # factory: escolhe o provider pelo MUSIC_PROVIDER
    providers/
      deezer.provider.ts          # ÚNICO arquivo que conhece a URL e o formato da Deezer
      cached.provider.ts          # cache em memória que envolve qualquer provider
  errors/AppError.ts              # AppError / ExternalApiError
  middleware/error.middleware.ts  # resposta padronizada de erro
  config/env.ts                   # variáveis da API de música
src/lib/api/                      # client do front: só fala com o nosso backend
```

**Para trocar de fonte:** crie `services/music/providers/outra.provider.ts` implementando `MusicProvider`, registre no `switch` de `music.provider.ts` e mude `MUSIC_PROVIDER` no `.env`. Rotas, front e banco não mudam.

Os `externalId` são da fonte atual. Se a fonte mudar com dados já salvos no banco, os IDs antigos deixam de bater com a nova fonte e será preciso uma migração.

### Rotas

| Rota | Retorno |
|---|---|
| `GET /albums/search?q=&limit=` | `{ data: AlbumSummary[] }` |
| `GET /albums/new-releases?limit=` | `{ data: AlbumSummary[] }` |
| `GET /albums/:externalId` | `{ data: Album }` (com faixas e artistas) |
| `GET /artists/search?q=&limit=` | `{ data: Artist[] }` |

### Erro padronizado

```json
{ "error": { "code": "EXTERNAL_API_UNAVAILABLE", "message": "O serviço de música está indisponível no momento." } }
```

| Código | Status | Quando |
|---|---|---|
| `VALIDATION_ERROR` | 400 | `q` ausente ou `limit` inválido |
| `NOT_FOUND` | 404 | Álbum inexistente na fonte ou rota inexistente |
| `EXTERNAL_API_RATE_LIMITED` | 429 | A fonte limitou as requisições |
| `EXTERNAL_API_UNAVAILABLE` | 502 | A fonte respondeu com erro 5xx ou com conteúdo inválido |
| `EXTERNAL_API_UNAVAILABLE` | 503 | Falha de rede ou serviço ocupado |
| `EXTERNAL_API_TIMEOUT` | 504 | A fonte não respondeu dentro de `MUSIC_API_TIMEOUT_MS` |
| `INTERNAL_ERROR` | 500 | Qualquer outro erro |

No front, `ApiErrorMessage` mostra uma mensagem em português para cada código. O client também gera `NETWORK_ERROR` quando o próprio backend está fora do ar.

## Variáveis de ambiente

As de música são opcionais; os valores abaixo são os padrões.

**Backend** (`backend/.env`, ver `backend/.env.example`):

```
MUSIC_PROVIDER=deezer
DEEZER_API_URL=https://api.deezer.com
MUSIC_API_TIMEOUT_MS=5000
MUSIC_CACHE_TTL_SECONDS=600   # 0 desliga o cache
```

**Front** (`.env.local`, ver `.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Como rodar e testar

```bash
# backend
cd backend
npm install
npm run dev     # http://localhost:3001
npm test        # testes do provider, do cache e do formato de erro

# front (na raiz, outro terminal)
npm run dev     # http://localhost:3000
```
