import { Suspense } from "react";
import { AlbumShelf, AlbumShelfSkeleton } from "@/components/AlbumShelf/AlbumShelf";
import { ApiErrorMessage } from "@/components/ApiErrorMessage/ApiErrorMessage";
import { getErrorCode, type ApiErrorCode } from "@/lib/api/client";
import { getNewReleases, type AlbumSummary } from "@/lib/api/music";
import styles from "./page.module.css";

const NEW_RELEASES_LIMIT = 12;

type NewReleasesResult =
  | { albums: AlbumSummary[]; errorCode: null }
  | { albums: null; errorCode: ApiErrorCode };

async function loadNewReleases(): Promise<NewReleasesResult> {
  try {
    return { albums: await getNewReleases(NEW_RELEASES_LIMIT), errorCode: null };
  } catch (error) {
    return { albums: null, errorCode: getErrorCode(error) };
  }
}

async function NewReleases() {
  const result = await loadNewReleases();

  if (result.errorCode) {
    return <ApiErrorMessage code={result.errorCode} title="Não foi possível carregar as novidades" />;
  }
  if (result.albums.length === 0) {
    return <p className={styles.empty}>Nenhuma novidade no momento.</p>;
  }
  return <AlbumShelf albums={result.albums} />;
}

export default function Home() {
  return (
    <div className={styles.page}>
      {/* TODO: incluir o nome do usuário ("Olá Daniel") quando a sessão estiver integrada. */}
      <h1 className={styles.greeting}>Olá! Confira as novidades que acabaram de sair!</h1>

      <section className={styles.section} aria-labelledby="novidades">
        <h2 id="novidades" className={styles.sectionTitle}>
          Novidades no nosso site
        </h2>
        <Suspense fallback={<AlbumShelfSkeleton />}>
          <NewReleases />
        </Suspense>
      </section>

      <section className={styles.section} aria-labelledby="populares">
        <h2 id="populares" className={styles.sectionTitle}>
          Álbuns populares
        </h2>
        {/* Populares saem do nosso banco (mais avaliados); entra quando existir a rota no backend. */}
        <p className={styles.empty}>
          Ainda não há álbuns populares. Assim que a comunidade começar a avaliar, eles aparecem aqui.
        </p>
      </section>
    </div>
  );
}
