// Testa o formato padronizado de erro de ponta a ponta (rota → middleware → HTTP).
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { after, before, describe, test } from "node:test";
import express from "express";
import { AppError, ExternalApiError } from "../src/errors/AppError";
import { errorHandler, notFoundHandler } from "../src/middleware/error.middleware";
import { createMusicRouter } from "../src/routes/music.routes";
import type { MusicProvider } from "../src/services/music/music.types";

// Provider falso: o termo buscado decide qual falha simular.
const failures: Record<string, () => Error> = {
  timeout: () => ExternalApiError.timeout(),
  limite: () => ExternalApiError.rateLimited(),
  fora: () => ExternalApiError.unavailable(503),
  invalido: () => ExternalApiError.unavailable(502),
  bug: () => new Error("erro inesperado"),
};

const provider: MusicProvider = {
  searchAlbums: async (query) => {
    const failure = failures[query];
    if (failure) throw failure();
    return [];
  },
  searchAlbumsByArtist: async (query) => {
    const failure = failures[query];
    if (failure) throw failure();
    return { artist: null, albums: [] };
  },
  getAlbum: async () => {
    throw AppError.notFound("Álbum não encontrado.");
  },
  getNewReleases: async () => [],
  searchArtists: async () => [],
};

let server: Server;
let baseUrl: string;

before(async () => {
  // Mesma ordem do server.ts: rotas, 404 e middleware de erro por último.
  const app = express();
  app.use(createMusicRouter(provider));
  app.use(notFoundHandler);
  app.use(errorHandler);
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

async function get(path: string) {
  const response = await fetch(baseUrl + path);
  return { status: response.status, body: await response.json() };
}

describe("formato padronizado de erro", () => {
  const cases: [string, number, string][] = [
    ["/albums/search?q=timeout", 504, "EXTERNAL_API_TIMEOUT"],
    ["/albums/search?q=limite", 429, "EXTERNAL_API_RATE_LIMITED"],
    ["/albums/search?q=fora", 503, "EXTERNAL_API_UNAVAILABLE"],
    ["/albums/search?q=invalido", 502, "EXTERNAL_API_UNAVAILABLE"],
    ["/albums/search?q=bug", 500, "INTERNAL_ERROR"],
    ["/albums/search", 400, "VALIDATION_ERROR"],
    ["/albums/search?q=ok&limit=0", 400, "VALIDATION_ERROR"],
    ["/albums/search/by-artist", 400, "VALIDATION_ERROR"],
    ["/albums/search/by-artist?q=timeout", 504, "EXTERNAL_API_TIMEOUT"],
    ["/albums/123", 404, "NOT_FOUND"],
    ["/rota-que-nao-existe", 404, "NOT_FOUND"],
  ];

  for (const [path, status, code] of cases) {
    test(`GET ${path} → ${status} ${code}`, async () => {
      const response = await get(path);
      assert.equal(response.status, status);
      assert.deepEqual(Object.keys(response.body), ["error"]);
      assert.equal(response.body.error.code, code);
      assert.equal(typeof response.body.error.message, "string");
    });
  }

  test("sucesso responde { data }", async () => {
    const response = await get("/albums/search?q=ok");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { data: [] });
  });

  test("busca por artista responde { data: { artist, albums } }", async () => {
    const response = await get("/albums/search/by-artist?q=ok");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { data: { artist: null, albums: [] } });
  });
});
