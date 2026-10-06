import { AlbumCover } from "@/components/AlbumCover/AlbumCover";
import type { Album } from "@/lib/api/music";
import { formatAlbumDuration, formatReleaseDate } from "@/lib/format";
import styles from "./AlbumHeader.module.css";

interface AlbumHeaderProps {
  album: Album;
}

export function AlbumHeader({ album }: AlbumHeaderProps) {
  const artists = album.artists.map((artist) => artist.name).join(", ");
  const trackCount = album.tracks.length || album.totalTracks;

  // Itens que faltarem na API (data, duração) não aparecem.
  const details = [
    album.releaseDate ? formatReleaseDate(album.releaseDate) : album.releaseYear?.toString(),
    trackCount > 0 ? `${trackCount} ${trackCount === 1 ? "música" : "músicas"}` : undefined,
    album.durationMs > 0 ? formatAlbumDuration(album.durationMs) : undefined,
  ].filter(Boolean);

  return (
    <header className={styles.header}>
      <div className={styles.cover}>
        <AlbumCover src={album.coverUrl} alt={`Capa do álbum ${album.title}`} />
      </div>

      <div className={styles.info}>
        <p className={styles.label}>Álbum</p>
        <h1 className={styles.title}>{album.title}</h1>
        <p className={styles.details}>
          {artists && <strong className={styles.artists}>{artists}</strong>}
          {details.map((detail) => (
            <span key={detail}> • {detail}</span>
          ))}
        </p>
      </div>
    </header>
  );
}