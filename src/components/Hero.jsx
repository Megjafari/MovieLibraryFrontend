import { TMDB_IMG_ORIG, TMDB_IMG_W500 } from '../api/index.js';
import styles from './Hero.module.css';

export default function Hero({ tmdbMovie, backendMovie, reviews, onWatch, onAdd, isInList }) {
  if (!tmdbMovie) return null;

  const backdrop = tmdbMovie.backdrop_path
    ? `${TMDB_IMG_ORIG}${tmdbMovie.backdrop_path}`
    : tmdbMovie.poster_path
    ? `${TMDB_IMG_W500}${tmdbMovie.poster_path}`
      : tmdbMovie._jikanImage
      ? tmdbMovie._jikanImage
    : null;

  const year = tmdbMovie.release_date?.slice(0, 4);
  const rating = tmdbMovie.vote_average?.toFixed(1);

  const movieReviews = backendMovie ? reviews.filter(r => r.movieId === backendMovie.id) : [];
  const avgRating = movieReviews.length
    ? (movieReviews.reduce((s, r) => s + r.rating, 0) / movieReviews.length).toFixed(1)
    : null;

  return (
    <div className={styles.hero}>
      {backdrop && (
        <div
          className={styles.bg}
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      <div className={styles.vignette} />

      <div className={styles.content}>
        {isInList && (
          <div className={styles.inListBadge}>✓ In your list</div>
        )}
        <h1 className={styles.title}>{tmdbMovie.title}</h1>

        <div className={styles.meta}>
          {year && <span className={styles.year}>{year}</span>}
          {rating && (
            <span className={styles.tmdbRating}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {rating} TMDB
            </span>
          )}
          {avgRating && (
            <span className={styles.myRating}>⭐ {avgRating}/5 your list</span>
          )}
        </div>

        <p className={styles.overview}>
          {tmdbMovie.overview?.slice(0, 200)}{tmdbMovie.overview?.length > 200 ? '…' : ''}
        </p>

        <div className={styles.actions}>
          {isInList ? (
            <button className={styles.btnPrimary} onClick={() => onWatch(tmdbMovie)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              View &amp; Review
            </button>
          ) : (
            <button className={styles.btnPrimary} onClick={() => onAdd(tmdbMovie)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add to list
            </button>
          )}
          <button className={styles.btnSecondary} onClick={() => onWatch(tmdbMovie)}>
            More info
          </button>
        </div>
      </div>
    </div>
  );
}