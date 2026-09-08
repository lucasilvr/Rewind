import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <h1>Rewind - Home</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <Link href="/profile/daniel">Ir para Perfil do Daniel</Link>
        <Link href="/album/kpop-demon-hunters">Ver Detalhes do Álbum</Link>
      </div>
    </main>
  );
}
