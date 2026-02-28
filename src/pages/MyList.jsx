import MovieCard from '../components/MovieCard.jsx';
import styles from '../App.module.css';

const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function MyList({
  myMovies, reviews, myTitleSet, tmdbCache,
  openBackendMovie, loadingBackend,
  tmdbTrending, tmdbPopular,
}) {
  const myMoviesEnriched = myMovies.map(m => {
    const td = tmdbCache[normalizeTitle(m.title)] ||
               (tmdbTrending || []).find(t => normalizeTitle(t.title) === normalizeTitle(m.title)) ||
               (tmdbPopular || []).find(t => normalizeTitle(t.title) === normalizeTitle(m.title));
    return td ? { ...m, poster_path: td.poster_path, vote_average: td.vote_average, release_date: td.release_date || m.releaseDate } : m;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>MY LIST</h1>
        <span className={styles.pageCount}>{myMovies.length} titles</span>
      </div>
      {loadingBackend ? (
        <div className={styles.loadingCenter}><span className={styles.spinner} /></div>
      ) : myMoviesEnriched.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎬</div>
          <p>Your list is empty.</p>
          <p>Browse and add your favorites!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {myMoviesEnriched.map(m => {
            const revs = reviews.filter(r => r.movieId === m.id);
            const avg = revs.length ? Math.round(revs.reduce((s, r) => s + r.rating, 0) / revs.length) : 0;
            return <MovieCard key={m.id} movie={m} isInList={true} reviewCount={revs.length} avgRating={avg} onClick={() => openBackendMovie(m)} />;
          })}
        </div>
      )}
    </div>
  );
}