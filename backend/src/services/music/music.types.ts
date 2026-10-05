// Formato normalizado dos dados de música, independente da API externa.
// Os campos seguem os models Album, Artist e Track do schema.prisma,
// para que o upsert (cache sob demanda) seja um mapeamento direto.

export interface ExternalArtist {
  externalId: string;
  name: string;
  imageUrl: string | null;
}

export interface ExternalTrack {
  externalId: string;
  /** "1", "2"... ou "disco-faixa" ("2-1") em álbuns com mais de um disco. */
  position: string;
  title: string;
  durationMs: number | null;
}

/** Álbum como aparece em listas (busca, novidades): sem faixas. */
export interface ExternalAlbumSummary {
  externalId: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  totalTracks: number;
  artists: ExternalArtist[];
}

export interface ExternalAlbum extends ExternalAlbumSummary {
  releaseDate: string | null;
  durationMs: number;
  tracks: ExternalTrack[];
}

export interface ListOptions {
  limit?: number;
}

export interface MusicProvider {
  searchAlbums(query: string, options?: ListOptions): Promise<ExternalAlbumSummary[]>;
  /** Lança AppError NOT_FOUND se o álbum não existir na fonte. */
  getAlbum(externalId: string): Promise<ExternalAlbum>;
  getNewReleases(options?: ListOptions): Promise<ExternalAlbumSummary[]>;
  searchArtists(query: string, options?: ListOptions): Promise<ExternalArtist[]>;
}
