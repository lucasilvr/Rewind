import { Suspense } from "react";
import { AlbumShelf, AlbumShelfSkeleton } from "@/components/AlbumShelf/AlbumShelf";
import { ApiErrorMessage } from "@/components/ApiErrorMessage/ApiErrorMessage";
import { EmptyState, Section } from "@/components/Section/Section";
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
    return <EmptyState>Nenhuma novidade no momento.</EmptyState>;
  }
  return <AlbumShelf albums={result.albums} />;
}

export default function Home() {
  return (
    <div className={styles.page}>
      {/* TODO: incluir o nome do usuário ("Olá Daniel") quando a sessão estiver integrada. */}
      <h1 className={styles.greeting}>Olá! Confira as novidades que acabaram de sair!</h1>

      <Section title="Novidades no nosso site">
        <Suspense fallback={<AlbumShelfSkeleton />}>
          <NewReleases />
        </Suspense>
      </Section>

      <Section title="Álbuns populares">
        {/* Populares saem do nosso banco (mais avaliados); entra quando existir a rota no backend. */}
        <EmptyState>
          Ainda não há álbuns populares. Assim que a comunidade começar a avaliar, eles aparecem aqui.
        </EmptyState>
      </Section>
    </div>
  );
}
