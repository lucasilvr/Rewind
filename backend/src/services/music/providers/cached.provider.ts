import type {
  ExternalAlbum,
  ExternalAlbumSummary,
  ExternalArtist,
  ExternalArtistAlbums,
  ListOptions,
  MusicProvider,
} from "../music.types";

export interface CacheOptions {
  ttlMs: number;
  /** Ao passar do limite, as entradas mais antigas são descartadas. */
  maxEntries?: number;
}

interface CacheEntry {
  expiresAt: number;
  value: Promise<unknown>;
}

/**
 * Cache em memória que envolve qualquer MusicProvider, para não estourar
 * o limite de requisições da API externa. Chamadas iguais em paralelo
 * compartilham a mesma requisição, e falhas não ficam guardadas.
 */
export class CachedMusicProvider implements MusicProvider {
  readonly #inner: MusicProvider;
  readonly #ttlMs: number;
  readonly #maxEntries: number;
  readonly #entries = new Map<string, CacheEntry>();

  constructor(inner: MusicProvider, options: CacheOptions) {
    this.#inner = inner;
    this.#ttlMs = options.ttlMs;
    this.#maxEntries = options.maxEntries ?? 500;
  }

  searchAlbums(query: string, options?: ListOptions): Promise<ExternalAlbumSummary[]> {
    const key = `searchAlbums:${query.toLowerCase()}:${options?.limit ?? ""}`;
    return this.#cached(key, () => this.#inner.searchAlbums(query, options));
  }

  searchAlbumsByArtist(query: string, options?: ListOptions): Promise<ExternalArtistAlbums> {
    const key = `searchAlbumsByArtist:${query.toLowerCase()}:${options?.limit ?? ""}`;
    return this.#cached(key, () => this.#inner.searchAlbumsByArtist(query, options));
  }

  getAlbum(externalId: string): Promise<ExternalAlbum> {
    return this.#cached(`getAlbum:${externalId}`, () => this.#inner.getAlbum(externalId));
  }

  getNewReleases(options?: ListOptions): Promise<ExternalAlbumSummary[]> {
    const key = `getNewReleases:${options?.limit ?? ""}`;
    return this.#cached(key, () => this.#inner.getNewReleases(options));
  }

  searchArtists(query: string, options?: ListOptions): Promise<ExternalArtist[]> {
    const key = `searchArtists:${query.toLowerCase()}:${options?.limit ?? ""}`;
    return this.#cached(key, () => this.#inner.searchArtists(query, options));
  }

  #cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.#entries.get(key);
    if (hit && hit.expiresAt > now) return hit.value as Promise<T>;

    const value = load();
    this.#entries.delete(key);
    this.#entries.set(key, { expiresAt: now + this.#ttlMs, value });
    value.catch(() => {
      if (this.#entries.get(key)?.value === value) this.#entries.delete(key);
    });

    while (this.#entries.size > this.#maxEntries) {
      const oldest = this.#entries.keys().next().value;
      if (oldest === undefined) break;
      this.#entries.delete(oldest);
    }
    return value;
  }
}
