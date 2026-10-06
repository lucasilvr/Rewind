"use client";

import { useState } from "react";
import { ReviewIcon } from "@/components/icons/icons";
import { ReviewModal } from "@/components/ReviewModal/ReviewModal";
import type { AlbumSummary } from "@/lib/api/music";
import styles from "./ReviewButton.module.css";

interface ReviewButtonProps {
  album: AlbumSummary;
}

/** Botão "Fazer review" da tela do álbum: abre o mesmo modal de review da home. */
export function ReviewButton({ album }: ReviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.button} onClick={() => setOpen(true)}>
        <ReviewIcon size={16} />
        Fazer review
      </button>
      <ReviewModal album={open ? album : null} onClose={() => setOpen(false)} />
    </>
  );
}