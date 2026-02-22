import MovieCard from './MovieCard.jsx';
import styles from './MovieRow.module.css';

export default function MovieRow({ title, movies, myMovieTitles, reviews, onCardClick, showAddHint }) {
  if (!movies?.length) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.row}>
        {movies.map(movie => {
          const titleKey = movie.title?.toLowerCase();
          const isInList = myMovieTitles.has(titleKey);
          const backendId = isInList ? [...myMovieTitles.entries ? myMovieTitles : new Map()].find?.(([k]) => k === titleKey)?.[1] : null;
          const movieReviews = reviews.filter(r => r.movieId === movie._backendId);
          const reviewCount = movieReviews.length;
          const avgRating = reviewCount
            ? Math.round(movieReviews.reduce((s, r) => s + r.rating, 0) / reviewCount)
            : 0;

          return (
            <MovieCard
              key={movie.id || movie._backendId}
              movie={movie}
              isInList={isInList}
              reviewCount={reviewCount}
              avgRating={avgRating}
              onClick={onCardClick}
            />
          );
        })}
      </div>
    </div>
  );
}
