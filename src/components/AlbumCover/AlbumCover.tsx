"use client";

import { useState } from "react";
import styles from "./AlbumCover.module.css";

export const DEFAULT_COVER_URL = "/images/default-cover.svg";

interface AlbumCoverProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

// Usa <img> em vez de next/image para não precisar liberar o domínio da
// fonte de música no next.config (trocar de fonte não deve mexer no front).
export function AlbumCover({ src, alt, className }: AlbumCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showDefault = !src || failedSrc === src;

  const markFailed = () => {
    if (src) setFailedSrc(src);
  };

  // Se a imagem falhar antes do React hidratar a página, o onError não dispara;
  // o ref confere se ela já terminou de carregar sem conteúdo.
  const checkAlreadyFailed = (img: HTMLImageElement | null) => {
    if (img && !showDefault && img.complete && img.naturalWidth === 0) markFailed();
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element -- ver comentário acima
    <img
      ref={checkAlreadyFailed}
      src={showDefault ? DEFAULT_COVER_URL : src}
      alt={alt}
      loading="lazy"
      onError={showDefault ? undefined : markFailed}
      className={className ? `${styles.cover} ${className}` : styles.cover}
    />
  );
}
