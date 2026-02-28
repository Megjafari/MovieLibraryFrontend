import { TMDB_IMG_W500 } from '../api/index.js';
import styles from './MovieCard.module.css';

export default function MovieCard({ movie, isInList, reviewCount, avgRating, onClick }) {
  const poster = movie._jikanImage || (movie.poster_path ? `${TMDB_IMG_W500}${movie.poster_path}` : null);
  const title   = movie.title;
  const year    = (movie.release_date || movie.releaseDate || '')?.slice(0, 4);
  const tmdbRating = movie.vote_average?.toFixed(1);

  return (
    <div className={styles.card} onClick={() => onClick(movie)}>
      {poster
        ? <img className={styles.poster} src={poster} alt={title} loading="lazy" />
        : <div className={styles.noPoster}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="m9 15 3-3 3 3M12 9v3"/></svg>
            <span>{title}</span>
          </div>
      }

      {isInList && (
        <div className={styles.inListBadge}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6 9 17l-5-5"/></svg>
          In list
        </div>
      )}

      <div className={styles.overlay}>
        <div className={styles.overlayTitle}>{title}</div>
        <div className={styles.overlayMeta}>
          {isInList && reviewCount > 0 ? (
            <span className={styles.stars}>
              {'★'.repeat(avgRating)}{'☆'.repeat(5 - avgRating)}
              <em>{reviewCount} rev.</em>
            </span>
          ) : tmdbRating ? (
            <span className={styles.tmdbScore}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {tmdbRating}
            </span>
          ) : null}
          {year && <span className={styles.year}>{year}</span>}
        </div>
      </div>
    </div>
  );
}