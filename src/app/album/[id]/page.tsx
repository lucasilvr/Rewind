import { AlbumHeader } from "@/components/AlbumHeader/AlbumHeader";
import { ApiErrorMessage } from "@/components/ApiErrorMessage/ApiErrorMessage";
import { TrackList } from "@/components/TrackList/TrackList";
import { getErrorCode } from "@/lib/api/client";
import { getAlbum, type Album } from "@/lib/api/music";
import styles from "./page.module.css";

interface AlbumDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AlbumDetailPage = async ({ params }: AlbumDetailPageProps) => {
  const { id } = await params;

  let album: Album;
  try {
    album = await getAlbum(id);
  } catch (error) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <ApiErrorMessage code={getErrorCode(error)} title="Não foi possível carregar o álbum" />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <AlbumHeader album={album} />

        <div className={styles.content}>
          <div className={styles.mainColumn}>
            <TrackList tracks={album.tracks} />
          </div>
          <aside className={styles.sidebar} />
        </div>
      </div>
    </main>
  );
};

export default AlbumDetailPage;