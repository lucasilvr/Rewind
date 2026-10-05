"use client";

import { Modal } from "@/components/Modal/Modal";
import type { AlbumSummary } from "@/lib/api/music";
import styles from "./ReviewModal.module.css";

interface ReviewModalProps {
  /** Álbum sendo avaliado; null = modal fechado. */
  album: AlbumSummary | null;
  onClose: () => void;
}

// O conteúdo (nota, favoritar, texto e salvar) entra na tarefa 5.4.
export function ReviewModal({ album, onClose }: ReviewModalProps) {
  return (
    <Modal open={album !== null} onClose={onClose} title="Review">
      <div className={styles.body} />
    </Modal>
  );
}
