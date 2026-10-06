import assert from "node:assert/strict";
import { afterEach, describe, mock, test } from "node:test";
import { AppError } from "../src/errors/AppError";
import { DeezerProvider } from "../src/services/music/providers/deezer.provider";

const BASE_URL = "https://deezer.test";

function createProvider(timeoutMs = 1000) {
  return new DeezerProvider({ baseUrl: BASE_URL, timeoutMs });
}

/** Mocka o fetch global respondendo JSON conforme o caminho da URL. */
function mockFetch(routes: Record<string, unknown>) {
  return mock.method(globalThis, "fetch", async (input: URL) => {
    const body = routes[input.pathname];
    if (body === undefined) return new Response("not found", { status: 404 });
    return Response.json(body);
  });
}

async function assertAppError(promise: Promise<unknown>, code: string, status: number) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, code);
    assert.equal(error.status, status);
    return true;
  });
}

afterEach(() => mock.restoreAll());

describe("DeezerProvider: mapeamento", () => {
  test("searchAlbums normaliza os campos, trata capa ausente e busca o ano no detalhe", async () => {
    const discovery = {
      id: 302127,
      title: "Discovery",
      cover_big: "https://cdn.test/images/cover/abc/500x500.jpg",
      nb_tracks: 14,
      artist: { id: 27, name: "Daft Punk", picture_big: "https://cdn.test/images/artist//500x500.jpg" },
    };
    const fetchMock = mockFetch({
      "/search/album": { data: [discovery] },
      "/album/302127": { ...discovery, release_date: "2001-03-07" },
    });

    const albums = await createProvider().searchAlbums("daft punk", { limit: 5 });

    assert.deepEqual(albums, [
      {
        externalId: "302127",
        title: "Discovery",
        coverUrl: "https://cdn.test/images/cover/abc/500x500.jpg",
        releaseYear: 2001,
        totalTracks: 14,
        artists: [{ externalId: "27", name: "Daft Punk", imageUrl: null }],
      },
    ]);
    const url = fetchMock.mock.calls[0].arguments[0] as URL;
    assert.equal(url.searchParams.get("q"), "daft punk");
    assert.equal(url.searchParams.get("limit"), "5");
  });

  test("searchAlbums mantém o álbum sem ano se o detalhe falhar", async () => {
    mockFetch({ "/search/album": { data: [{ id: 7, title: "Sem detalhe", artist: { id: 1, name: "X" } }] } });

    const albums = await createProvider().searchAlbums("x");

    assert.equal(albums.length, 1);
    assert.equal(albums[0].releaseYear, null);
  });

  test("searchAlbumsByArtist acha o artista e lista os álbuns dele, mais novos primeiro", async () => {
    const fetchMock = mockFetch({
      "/search/artist": { data: [{ id: 27, name: "Daft Punk", picture_big: "https://cdn.test/images/artist/dp/500x500.jpg" }] },
      "/artist/27/albums": {
        data: [
          { id: 1, title: "Homework", release_date: "1997-01-20" },
          { id: 2, title: "Random Access Memories", release_date: "2013-05-17" },
        ],
      },
    });

    const result = await createProvider().searchAlbumsByArtist("daft", { limit: 10 });

    assert.deepEqual(result.artist, {
      externalId: "27",
      name: "Daft Punk",
      imageUrl: "https://cdn.test/images/artist/dp/500x500.jpg",
    });
    assert.deepEqual(result.albums.map((album) => [album.title, album.releaseYear]), [
      ["Random Access Memories", 2013],
      ["Homework", 1997],
    ]);
    assert.deepEqual(result.albums[0].artists.map((artist) => artist.name), ["Daft Punk"]);
    const albumsUrl = fetchMock.mock.calls[1].arguments[0] as URL;
    assert.equal(albumsUrl.searchParams.get("limit"), "10");
  });

  test("searchAlbumsByArtist sem artista encontrado devolve lista vazia sem nova chamada", async () => {
    const fetchMock = mockFetch({ "/search/artist": { data: [] } });

    const result = await createProvider().searchAlbumsByArtist("ninguém");

    assert.deepEqual(result, { artist: null, albums: [] });
    assert.equal(fetchMock.mock.callCount(), 1);
  });

  test("getAlbum junta álbum, artistas principais e todas as faixas", async () => {
    mockFetch({
      "/album/1": {
        id: 1,
        title: "Álbum duplo",
        cover_big: "https://cdn.test/images/cover//500x500.jpg",
        release_date: "1995-10-23",
        nb_tracks: 2,
        artist: { id: 10, name: "Banda" },
        contributors: [
          { id: 10, name: "Banda", role: "Main" },
          { id: 11, name: "Convidado", role: "Featured" },
        ],
      },
      "/album/1/tracks": {
        data: [
          { id: 100, title: "Faixa A", duration: 200, track_position: 1, disk_number: 1 },
          { id: 101, title: "Faixa B", duration: 0, track_position: 1, disk_number: 2 },
        ],
      },
    });

    const album = await createProvider().getAlbum("1");

    assert.equal(album.coverUrl, null);
    assert.equal(album.releaseYear, 1995);
    assert.equal(album.releaseDate, "1995-10-23");
    assert.deepEqual(album.artists.map((artist) => artist.name), ["Banda"]);
    assert.deepEqual(album.tracks, [
      { externalId: "100", position: "1-1", title: "Faixa A", durationMs: 200000 },
      { externalId: "101", position: "2-1", title: "Faixa B", durationMs: null },
    ]);
    assert.equal(album.durationMs, 200000);
  });

  test("getAlbum trata data desconhecida (0000-00-00) e álbum sem faixas", async () => {
    mockFetch({
      "/album/2": { id: 2, title: "Álbum sem data", release_date: "0000-00-00", nb_tracks: 0 },
      "/album/2/tracks": { data: [] },
    });

    const album = await createProvider().getAlbum("2");

    assert.equal(album.releaseDate, null);
    assert.equal(album.releaseYear, null);
    assert.equal(album.durationMs, 0);
  });

  test("getNewReleases usa a seleção editorial quando releases vem vazio e busca o ano", async () => {
    mockFetch({
      "/editorial/0/releases": { data: [] },
      "/editorial/0/selection": { data: [{ id: 5, title: "Novo", artist: { id: 1, name: "X" } }] },
      "/album/5": { id: 5, title: "Novo", release_date: "2026-09-30", nb_tracks: 9, artist: { id: 1, name: "X" } },
    });

    const albums = await createProvider().getNewReleases({ limit: 10 });

    assert.equal(albums.length, 1);
    assert.equal(albums[0].releaseYear, 2026);
    assert.equal(albums[0].totalTracks, 9);
  });
});

describe("DeezerProvider: erros", () => {
  test("ID não numérico vira NOT_FOUND sem chamar a API", async () => {
    const fetchMock = mockFetch({});
    await assertAppError(createProvider().getAlbum("../search"), "NOT_FOUND", 404);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  test("erro 800 da Deezer (no data) vira NOT_FOUND", async () => {
    mockFetch({ "/album/9": { error: { type: "DataException", message: "no data", code: 800 } }, "/album/9/tracks": { data: [] } });
    await assertAppError(createProvider().getAlbum("9"), "NOT_FOUND", 404);
  });

  test("erro 4 da Deezer (quota) vira EXTERNAL_API_RATE_LIMITED", async () => {
    mockFetch({ "/search/album": { error: { type: "Exception", message: "Quota limit exceeded", code: 4 } } });
    await assertAppError(createProvider().searchAlbums("x"), "EXTERNAL_API_RATE_LIMITED", 429);
  });

  test("HTTP 429 vira EXTERNAL_API_RATE_LIMITED", async () => {
    mock.method(globalThis, "fetch", async () => new Response("", { status: 429 }));
    await assertAppError(createProvider().searchAlbums("x"), "EXTERNAL_API_RATE_LIMITED", 429);
  });

  test("HTTP 500 vira EXTERNAL_API_UNAVAILABLE 502", async () => {
    mock.method(globalThis, "fetch", async () => new Response("erro", { status: 500 }));
    await assertAppError(createProvider().searchAlbums("x"), "EXTERNAL_API_UNAVAILABLE", 502);
  });

  test("resposta que não é JSON vira EXTERNAL_API_UNAVAILABLE 502", async () => {
    mock.method(globalThis, "fetch", async () => new Response("<html>", { status: 200 }));
    await assertAppError(createProvider().searchAlbums("x"), "EXTERNAL_API_UNAVAILABLE", 502);
  });

  test("falha de rede vira EXTERNAL_API_UNAVAILABLE 503", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("fetch failed");
    });
    await assertAppError(createProvider().searchAlbums("x"), "EXTERNAL_API_UNAVAILABLE", 503);
  });

  test("timeout vira EXTERNAL_API_TIMEOUT", async () => {
    // Simula uma API que nunca responde; o intervalo só mantém o processo vivo,
    // porque o timer do AbortSignal.timeout não segura o event loop sozinho.
    mock.method(
      globalThis,
      "fetch",
      (_input: URL, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          const keepAlive = setInterval(() => {}, 1000);
          init.signal?.addEventListener("abort", () => {
            clearInterval(keepAlive);
            reject(init.signal?.reason);
          });
        }),
    );
    await assertAppError(createProvider(20).searchAlbums("x"), "EXTERNAL_API_TIMEOUT", 504);
  });
});
