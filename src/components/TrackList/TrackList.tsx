import type { Track } from "@/lib/api/music";
import { formatTrackDuration } from "@/lib/format";
import styles from "./TrackList.module.css";

interface TrackListProps {
	tracks: Track[];
}

// As músicas aparecem só aqui: não são clicáveis, pesquisáveis nem avaliáveis.
export function TrackList({ tracks }: TrackListProps) {
	return (
		<section>
			<h2 className={styles.heading}>Lista de faixas</h2>

			{tracks.length === 0 ? (
				<p className={styles.empty}>
					Nenhuma música disponível para este álbum.
				</p>
			) : (
				<ol className={styles.list}>
					{tracks.map((track) => (
						<li key={track.externalId} className={styles.track}>
							<span className={styles.position}>{track.position}</span>
							<span className={styles.title}>{track.title}</span>
							<span className={styles.duration}>
								{formatTrackDuration(track.durationMs)}
							</span>
						</li>
					))}
				</ol>
			)}
		</section>
	);
}
