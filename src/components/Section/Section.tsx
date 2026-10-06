import { useId } from "react";
import styles from "./Section.module.css";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

/** Seção de página com título em caixa alta e linha embaixo (padrão da Home e da busca). */
export function Section({ title, children }: SectionProps) {
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Mensagem de lista vazia, em caixa tracejada. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
