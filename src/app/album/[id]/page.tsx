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
        {/* Cabeçalho completo (capa, artista, data, duração) fica na 4.3-F1. */}
        <h1 className={styles.title}>{album.title}</h1>

        <div className={styles.content}>
          <div className={styles.mainColumn}>
            <TrackList tracks={album.tracks} />
          </div>
          {/* Coluna da direita (média e botão "Avaliar") fica na 4.3-F3 e 4.3-F5. */}
          <aside className={styles.sidebar} />
        </div>
      </div>
    </main>
  );
};

export default AlbumDetailPage;