import { apiGet } from "./client";

export interface AlbumRating {
  albumId: string;
  /** null quando o álbum ainda não tem avaliações. */
  averageRating: number | null;
  ratingsCount: number;
}

interface DataResponse<T> {
  data: T;
}

export async function getAlbumRating(externalId: string): Promise<AlbumRating> {
  const response = await apiGet<DataResponse<AlbumRating>>(`/albums/${encodeURIComponent(externalId)}/rating`);
  return response.data;
}