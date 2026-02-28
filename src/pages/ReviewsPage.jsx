import styles from '../App.module.css';

export default function ReviewsPage({ reviews, myMovies, openBackendMovie, handleDeleteReview }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>REVIEWS</h1>
        <span className={styles.pageCount}>{reviews.length} total</span>
      </div>
      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <p>No reviews yet.</p>
          <p>Open a movie from your list and review it!</p>
        </div>
      ) : (
        <div className={styles.reviewsPage}>
          {[...reviews].reverse().map(r => {
            const movie = myMovies.find(m => m.id === r.movieId);
            return (
              <div key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewMovieTitle} onClick={() => movie && openBackendMovie(movie)}>
                  {movie?.title || 'Unknown movie'} →
                </div>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewTop}>
                    <div className={styles.reviewAvatar}>R{r.id}</div>
                    <div className={styles.reviewStars}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      <span className={styles.reviewScore}>{r.rating}/5</span>
                    </div>
                    <div className={styles.reviewBtns}>
                      <button className={styles.rEditBtn} onClick={() => movie && openBackendMovie(movie)} title="Edit">✏️</button>
                      <button className={styles.rDelBtn} onClick={() => handleDeleteReview(r.id)} title="Delete">🗑</button>
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}