// Único arquivo que conhece a URL e o formato da API da Deezer.
// Documentação: https://developers.deezer.com/api

import { AppError, ExternalApiError } from "../../../errors/AppError";
import type {
  ExternalAlbum,
  ExternalAlbumSummary,
  ExternalArtist,
  ExternalArtistAlbums,
  ExternalTrack,
  ListOptions,
  MusicProvider,
} from "../music.types";

const DEFAULT_BASE_URL = "https://api.deezer.com";
const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 50;
// Listas sem ano (novidades, busca por nome) custam 1 chamada extra por álbum para buscá-lo;
// limite baixo para poupar a cota.
const MAX_DETAILED_ALBUMS = 25;
// /album/{id} só embute as 25 primeiras faixas; /album/{id}/tracks com limite alto traz todas.
const MAX_TRACKS = 500;

// Códigos de erro que a Deezer devolve no corpo (com HTTP 200).
const DEEZER_QUOTA_EXCEEDED = 4;
const DEEZER_SERVICE_BUSY = 700;
const DEEZER_DATA_NOT_FOUND = 800;

// Formato bruto da Deezer (só os campos que usamos).
interface DeezerArtist {
  id: number;
  name: string;
  picture_big?: string;
  role?: string;
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover_big?: string;
  release_date?: string;
  nb_tracks?: number;
  artist?: DeezerArtist;
  contributors?: DeezerArtist[];
}

interface DeezerTrack {
  id: number;
  title: string;
  duration?: number;
  track_position?: number;
  disk_number?: number;
}

interface DeezerList<T> {
  data: T[];
}

interface DeezerErrorBody {
  error: { type?: string; message?: string; code?: number };
}

export interface DeezerProviderOptions {
  baseUrl?: string;
  timeoutMs: number;
}

export class DeezerProvider implements MusicProvider {
  readonly #baseUrl: string;
  readonly #timeoutMs: number;

  constructor(options: DeezerProviderOptions) {
    this.#baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#timeoutMs = options.timeoutMs;
  }

  async searchAlbums(query: string, options?: ListOptions): Promise<ExternalAlbumSummary[]> {
    // A busca geral ordena melhor por relevância que o filtro album:"..." da Deezer.
    const result = await this.#request<DeezerList<DeezerAlbum>>("/search/album", {
      q: query,
      limit: Math.min(listLimit(options), MAX_DETAILED_ALBUMS),
    });
    return (await this.#withReleaseDate(result.data)).map(toAlbumSummary);
  }

  async searchAlbumsByArtist(query: string, options?: ListOptions): Promise<ExternalArtistAlbums> {
    // O filtro artist:"..." da Deezer traz resultados pouco relevantes; achar o artista
    // e listar os álbuns dele é mais preciso e já vem com a data de lançamento.
    const artists = await this.#request<DeezerList<DeezerArtist>>("/search/artist", { q: query, limit: 1 });
    const artist = artists.data[0];
    if (!artist) return { artist: null, albums: [] };

    const albums = await this.#request<DeezerList<DeezerAlbum>>(`/artist/${artist.id}/albums`, {
      limit: listLimit(options),
    });
    const newestFirst = [...albums.data].sort((a, b) => (b.release_date ?? "").localeCompare(a.release_date ?? ""));
    return {
      artist: toArtist(artist),
      // A lista de álbuns do artista não repete o artista em cada item.
      albums: newestFirst.map((album) => toAlbumSummary({ ...album, artist })),
    };
  }

  async getAlbum(externalId: string): Promise<ExternalAlbum> {
    // IDs da Deezer são numéricos; qualquer outra coisa não existe lá.
    if (!/^\d+$/.test(externalId)) throw AppError.notFound("Álbum não encontrado.");

    const [album, tracks] = await Promise.all([
      this.#request<DeezerAlbum>(`/album/${externalId}`),
      this.#request<DeezerList<DeezerTrack>>(`/album/${externalId}/tracks`, { limit: MAX_TRACKS }),
    ]);

    const albumTracks = toTracks(tracks.data);
    return { 
      ...toAlbumSummary(album), 
      releaseDate: releaseDate(album.release_date),
      durationMs: albumTracks.reduce((total, track) => total + (track.durationMs ?? 0), 0),
      tracks: albumTracks,
    };
  }

  async getNewReleases(options?: ListOptions): Promise<ExternalAlbumSummary[]> {
    const limit = Math.min(options?.limit ?? DEFAULT_LIST_LIMIT, MAX_DETAILED_ALBUMS);

    // /editorial/0/releases às vezes vem vazio; a seleção editorial é o plano B.
    let albums = (await this.#request<DeezerList<DeezerAlbum>>("/editorial/0/releases", { limit })).data;
    if (albums.length === 0) {
      albums = (await this.#request<DeezerList<DeezerAlbum>>("/editorial/0/selection")).data;
    }

    return (await this.#withReleaseDate(albums.slice(0, limit))).map(toAlbumSummary);
  }

  async searchArtists(query: string, options?: ListOptions): Promise<ExternalArtist[]> {
    const result = await this.#request<DeezerList<DeezerArtist>>("/search/artist", {
      q: query,
      limit: listLimit(options),
    });
    return result.data.map(toArtist);
  }

  /**
   * As listas da Deezer (busca, editorial) não trazem release_date; o detalhe do álbum traz.
   * Se o detalhe falhar, o álbum segue sem ano em vez de derrubar a lista.
   */
  #withReleaseDate(albums: DeezerAlbum[]): Promise<DeezerAlbum[]> {
    return Promise.all(
      albums.map((album) =>
        album.release_date
          ? album
          : this.#request<DeezerAlbum>(`/album/${album.id}`).catch(() => album),
      ),
    );
  }

  async #request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(this.#baseUrl + path);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

    let body: unknown;
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.#timeoutMs),
      });

      if (response.status === 429) throw ExternalApiError.rateLimited(`HTTP 429 em ${path}`);
      if (response.status === 503) throw ExternalApiError.unavailable(503, `HTTP 503 em ${path}`);
      if (!response.ok) throw ExternalApiError.unavailable(502, `HTTP ${response.status} em ${path}`);

      body = await response.json();
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isTimeout(error)) throw ExternalApiError.timeout(error);
      // Falha de rede (DNS, conexão recusada) ou JSON inválido.
      throw ExternalApiError.unavailable(error instanceof SyntaxError ? 502 : 503, error);
    }

    if (isDeezerError(body)) throw fromDeezerError(body, path);
    return body as T;
  }
}

function listLimit(options?: ListOptions): number {
  return Math.min(options?.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}

function isDeezerError(body: unknown): body is DeezerErrorBody {
  return typeof body === "object" && body !== null && "error" in body;
}

function fromDeezerError(body: DeezerErrorBody, path: string): AppError {
  const cause = `Deezer erro ${body.error.code} (${body.error.message}) em ${path}`;
  switch (body.error.code) {
    case DEEZER_DATA_NOT_FOUND:
      return AppError.notFound("Álbum não encontrado.");
    case DEEZER_QUOTA_EXCEEDED:
      return ExternalApiError.rateLimited(cause);
    case DEEZER_SERVICE_BUSY:
      return ExternalApiError.unavailable(503, cause);
    default:
      return ExternalApiError.unavailable(502, cause);
  }
}

/** A Deezer devolve URL com hash vazio (".../images/cover//500x500...") quando não há imagem. */
function imageUrl(url: string | undefined): string | null {
  if (!url || /\/images\/\w+\/\//.test(url)) return null;
  return url;
}

function releaseYear(releaseDate: string | undefined): number | null {
  const year = Number(releaseDate?.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

function toArtist(artist: DeezerArtist): ExternalArtist {
  return {
    externalId: String(artist.id),
    name: artist.name,
    imageUrl: imageUrl(artist.picture_big),
  };
}

function albumArtists(album: DeezerAlbum): DeezerArtist[] {
  // contributors só vem no detalhe do álbum; nas listas há apenas o artista principal.
  const main = album.contributors?.filter((artist) => artist.role === "Main") ?? [];
  if (main.length > 0) return main;
  return album.artist ? [album.artist] : [];
}

function toAlbumSummary(album: DeezerAlbum): ExternalAlbumSummary {
  return {
    externalId: String(album.id),
    title: album.title,
    coverUrl: imageUrl(album.cover_big),
    releaseYear: releaseYear(album.release_date),
    totalTracks: album.nb_tracks ?? 0,
    artists: albumArtists(album).map(toArtist),
  };
}

function toTracks(tracks: DeezerTrack[]): ExternalTrack[] {
  const multiDisc = tracks.some((track) => (track.disk_number ?? 1) > 1);

  return tracks.map((track, index) => {
    const number = track.track_position ?? index + 1;
    return {
      externalId: String(track.id),
      position: multiDisc ? `${track.disk_number ?? 1}-${number}` : String(number),
      title: track.title,
      durationMs: track.duration ? track.duration * 1000 : null,
    };
  });
}
function releaseDate(value: string | undefined): string | null {
  if(!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return null;
  return value;
}