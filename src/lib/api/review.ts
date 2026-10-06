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

export interface ReviewAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

/** Resenha (avaliação com texto) como a rota /albums/:id/reviews devolve. */
export interface AlbumReview {
  id: string;
  rating: number;
  content: string;
  /** Data ISO (ex.: "2026-10-05T14:30:00.000Z"). */
  createdAt: string;
  user: ReviewAuthor;
}

/** Resenhas do álbum, das mais recentes para as mais antigas. */
export async function getAlbumReviews(externalId: string): Promise<AlbumReview[]> {
  const response = await apiGet<DataResponse<AlbumReview[]>>(`/albums/${encodeURIComponent(externalId)}/reviews`);
  return response.data;
}