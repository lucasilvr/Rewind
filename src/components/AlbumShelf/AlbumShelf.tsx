"use client";

import { useState } from "react";
import { AlbumCard, AlbumCardSkeleton } from "@/components/AlbumCard/AlbumCard";
import { ReviewModal } from "@/components/ReviewModal/ReviewModal";
import type { AlbumSummary } from "@/lib/api/music";
import styles from "./AlbumShelf.module.css";

interface AlbumShelfProps {
  albums: AlbumSummary[];
}

/** Grid de álbuns que abre o modal de review ao clicar no botão do card. */
export function AlbumShelf({ albums }: AlbumShelfProps) {
  const [reviewing, setReviewing] = useState<AlbumSummary | null>(null);

  return (
    <>
      <ul className={styles.grid}>
        {albums.map((album) => (
          <li key={album.externalId}>
            <AlbumCard album={album} onReview={setReviewing} />
          </li>
        ))}
      </ul>
      <ReviewModal album={reviewing} onClose={() => setReviewing(null)} />
    </>
  );
}

export function AlbumShelfSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={styles.grid} aria-label="Carregando álbuns">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <AlbumCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
