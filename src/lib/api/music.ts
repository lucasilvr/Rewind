import { apiGet } from "./client";

// Espelha o formato que o backend devolve (backend/src/services/music/music.types.ts).

export interface Artist {
  externalId: string;
  name: string;
  imageUrl: string | null;
}

export interface Track {
  externalId: string;
  position: string;
  title: string;
  durationMs: number | null;
}

export interface AlbumSummary {
  externalId: string;
  title: string;
  coverUrl: string | null;
  /** Vem null na busca: a fonte atual não informa o ano nas listas. */
  releaseYear: number | null;
  totalTracks: number;
  artists: Artist[];
}

export interface Album extends AlbumSummary {
  releaseDate: string | null;
  durationMs: number;
  tracks: Track[];
}

interface DataResponse<T> {
  data: T;
}

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export async function searchAlbums(query: string, limit?: number): Promise<AlbumSummary[]> {
  const response = await apiGet<DataResponse<AlbumSummary[]>>(withQuery("/albums/search", { q: query, limit }));
  return response.data;
}

export async function getNewReleases(limit?: number): Promise<AlbumSummary[]> {
  const response = await apiGet<DataResponse<AlbumSummary[]>>(withQuery("/albums/new-releases", { limit }));
  return response.data;
}

export async function getAlbum(externalId: string): Promise<Album> {
  const response = await apiGet<DataResponse<Album>>(`/albums/${encodeURIComponent(externalId)}`);
  return response.data;
}

export async function searchArtists(query: string, limit?: number): Promise<Artist[]> {
  const response = await apiGet<DataResponse<Artist[]>>(withQuery("/artists/search", { q: query, limit }));
  return response.data;
}
