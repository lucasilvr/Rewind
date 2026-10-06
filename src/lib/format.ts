/** Duração de uma faixa no formato "m:ss" (ex.: 225000 → "3:45"). */
export function formatTrackDuration(durationMs: number | null): string {
  if (durationMs === null) return "—";

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Duração total de um álbum (ex.: 3640000 → "1 h 1 min", 2700000 → "45 min"). */
export function formatAlbumDuration(durationMs: number): string {
  const totalMinutes = Math.round(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

const releaseDateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Data de lançamento "AAAA-MM-DD" por extenso (ex.: "7 de março de 2001"). */
export function formatReleaseDate(releaseDate: string): string {
  const [year, month, day] = releaseDate.split("-").map(Number);
  return releaseDateFormat.format(new Date(Date.UTC(year, month - 1, day)));
}