/** Duração de uma faixa no formato "m:ss" (ex.: 225000 → "3:45"). */
export function formatTrackDuration(durationMs: number | null): string {
  if (durationMs === null) return "—";

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}