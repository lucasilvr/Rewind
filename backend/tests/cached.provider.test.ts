import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { ExternalApiError } from "../src/errors/AppError";
import type { MusicProvider } from "../src/services/music/music.types";
import { CachedMusicProvider } from "../src/services/music/providers/cached.provider";

function fakeProvider(): MusicProvider {
  return {
    searchAlbums: async () => [],
    searchAlbumsByArtist: async () => ({ artist: null, albums: [] }),
    getAlbum: async (externalId) => ({
      externalId,
      title: "Álbum",
      coverUrl: null,
      releaseYear: 2000,
      releaseDate: "2000-01-01",
      durationMs: 0,
      totalTracks: 0,
      artists: [],
      tracks: [],
    }),
    getNewReleases: async () => [],
    searchArtists: async () => [],
  };
}

test("repete o resultado em cache dentro do TTL", async () => {
  const inner = fakeProvider();
  const getAlbum = mock.method(inner, "getAlbum");
  const cached = new CachedMusicProvider(inner, { ttlMs: 60_000 });

  await cached.getAlbum("1");
  await cached.getAlbum("1");
  await cached.getAlbum("2");

  assert.equal(getAlbum.mock.callCount(), 2);
});

test("não guarda falhas no cache", async () => {
  const inner = fakeProvider();
  let calls = 0;
  mock.method(inner, "searchAlbums", async () => {
    calls += 1;
    if (calls === 1) throw ExternalApiError.unavailable(503);
    return [];
  });
  const cached = new CachedMusicProvider(inner, { ttlMs: 60_000 });

  await assert.rejects(cached.searchAlbums("x"));
  assert.deepEqual(await cached.searchAlbums("x"), []);
  assert.equal(calls, 2);
});

test("descarta as entradas mais antigas ao passar do limite", async () => {
  const inner = fakeProvider();
  const getAlbum = mock.method(inner, "getAlbum");
  const cached = new CachedMusicProvider(inner, { ttlMs: 60_000, maxEntries: 2 });

  await cached.getAlbum("1");
  await cached.getAlbum("2");
  await cached.getAlbum("3");
  await cached.getAlbum("1");

  assert.equal(getAlbum.mock.callCount(), 4);
});
