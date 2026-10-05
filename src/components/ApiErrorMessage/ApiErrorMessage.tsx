"use client";

import { useRouter } from "next/navigation";
import type { ApiErrorCode } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessages";
import styles from "./ApiErrorMessage.module.css";

interface ApiErrorMessageProps {
  code: ApiErrorCode;
  title?: string;
  /** Sem onRetry, o botão recarrega os dados da página (útil em Server Components). */
  onRetry?: () => void;
}

export function ApiErrorMessage({ code, title = "Não foi possível carregar", onRetry }: ApiErrorMessageProps) {
  const router = useRouter();
  const canRetry = code !== "NOT_FOUND" && code !== "VALIDATION_ERROR";

  return (
    <div role="alert" className={styles.wrapper}>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{getErrorMessage(code)}</p>
      {canRetry && (
        <button type="button" className={styles.retry} onClick={onRetry ?? (() => router.refresh())}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
