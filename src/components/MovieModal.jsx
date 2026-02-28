import { useState } from 'react';
import { TMDB_IMG_ORIG, TMDB_IMG_W500 } from '../api/index.js';
import StarRating from './StarRating.jsx';
import styles from './MovieModal.module.css';

function ReviewCard({ review, onDelete, onEdit }) {
  return (
    <div className={styles.rCard}>
      <div className={styles.rTop}>
        <div className={styles.rLeft}>
          <div className={styles.rAvatar}>R{review.id}</div>
          <StarRating value={review.rating} readonly />
        </div>
        <div className={styles.rBtns}>
          <button className={styles.rEditBtn} onClick={() => onEdit(review)} title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className={styles.rDelBtn} onClick={() => onDelete(review.id)} title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <p className={styles.rComment}>{review.comment}</p>
    </div>
  );
}

function ReviewForm({ movieId, initial, onSubmit, onCancel }) {
  const [comment, setComment] = useState(initial?.comment || '');
  const [rating,  setRating]  = useState(initial?.rating  || 0);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial;

  const handleSubmit = async () => {
    if (!comment.trim() || rating === 0) return;
    setLoading(true);
    await onSubmit({ comment, rating, movieId });
    if (!isEdit) { setComment(''); setRating(0); }
    setLoading(false);
  };

  return (
    <div className={styles.rForm}>
      <p className={styles.rFormTitle}>{isEdit ? '✏️ Edit review' : '✍️ Write a review'}</p>
      <textarea
        className={styles.rTextarea}
        placeholder="What did you think of the movie?"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />
      <div className={styles.rFormBottom}>
        <StarRating value={rating} onChange={setRating} />
        <div className={styles.rFormBtns}>
          {onCancel && <button className={styles.btnGhost} onClick={onCancel}>Cancel</button>}
          <button
            className={styles.btnRed}
            onClick={handleSubmit}
            disabled={loading || !comment.trim() || rating === 0}
          >
            {loading ? <span className={styles.spinner} /> : isEdit ? 'Save' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MovieModal({
  backendMovie,
  tmdbMovie,
  reviews,
  isInList,
  onClose,
  onAddToList,
  onDeleteFromList,
  onCreateReview,
  onUpdateReview,
  onDeleteReview,
  onEditMovie,
}) {
  const [editingReview, setEditingReview] = useState(null);
  const [showForm,      setShowForm]      = useState(false);

  const backdrop = tmdbMovie?.backdrop_path
    ? `${TMDB_IMG_ORIG}${tmdbMovie.backdrop_path}`
    : tmdbMovie?.poster_path
    ? `${TMDB_IMG_W500}${tmdbMovie.poster_path}`
      : tmdbMovie?._jikanImage
      ? tmdbMovie._jikanImage
    : null;

  const movieReviews = backendMovie ? reviews.filter(r => r.movieId === backendMovie.id) : [];
  const avgRating = movieReviews.length
    ? (movieReviews.reduce((s, r) => s + r.rating, 0) / movieReviews.length).toFixed(1)
    : null;

  const year       = (tmdbMovie?.release_date || backendMovie?.releaseDate || '').slice(0, 4);
  const title      = tmdbMovie?.title || backendMovie?.title || '';
  const overview   = tmdbMovie?.overview || backendMovie?.description || '';
  const tmdbScore  = tmdbMovie?.vote_average?.toFixed(1);

  const handleCreateReview = async (data) => {
    await onCreateReview(data);
    setShowForm(false);
  };

  const handleUpdateReview = async (data) => {
    await onUpdateReview(editingReview.id, { ...data, movieId: backendMovie.id });
    setEditingReview(null);
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.backdropWrap}>
          {backdrop
            ? <img className={styles.backdrop} src={backdrop} alt="" />
            : <div className={styles.backdropFallback}>🎬</div>
          }
          <div className={styles.backdropGrad} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{title}</h2>

          <div className={styles.meta}>
            {year && <span className={styles.year}>{year}</span>}
            {tmdbScore && (
              <span className={styles.tmdbScore}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {tmdbScore} TMDB
              </span>
            )}
            {avgRating && (
              <span className={styles.myScore}>
                {'★'.repeat(Math.round(avgRating))} {avgRating}/5 ({movieReviews.length})
              </span>
            )}
            {tmdbMovie?.genres?.map(g => (
              <span key={g.id} className={styles.genre}>{g.name}</span>
            ))}
          </div>

          {overview && <p className={styles.overview}>{overview}</p>}

          <div className={styles.actions}>
            {isInList ? (
              <>
                <button className={styles.btnPrimary} onClick={() => { setShowForm(v => !v); setEditingReview(null); }}>
                  {showForm ? '✕ Cancel' : '✍️ Review'}
                </button>
                <button className={styles.btnGhost} onClick={() => onEditMovie(backendMovie)}>
                  ✏️ Edit
                </button>
                <button className={styles.btnDanger} onClick={() => onDeleteFromList(backendMovie.id)}>
                  🗑 Remove
                </button>
              </>
            ) : (
              <button className={styles.btnPrimary} onClick={() => onAddToList(tmdbMovie)}>
                ＋ Add to list
              </button>
            )}
          </div>

          {isInList && (
            <>
              <hr className={styles.divider} />
              <h3 className={styles.reviewsTitle}>REVIEWS ({movieReviews.length})</h3>

              {showForm && !editingReview && (
                <ReviewForm
                  key="new"
                  movieId={backendMovie.id}
                  onSubmit={handleCreateReview}
                  onCancel={() => setShowForm(false)}
                />
              )}

              {editingReview && (
                <ReviewForm
                  key={`edit-${editingReview.id}`}
                  movieId={backendMovie.id}
                  initial={editingReview}
                  onSubmit={handleUpdateReview}
                  onCancel={() => setEditingReview(null)}
                />
              )}

              {movieReviews.length === 0 && !showForm ? (
                <p className={styles.emptyReviews}>No reviews yet — be the first! 🎬</p>
              ) : (
                <div className={styles.reviewList}>
                  {movieReviews.map(r => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      onDelete={onDeleteReview}
                      onEdit={rev => { setEditingReview(rev); setShowForm(false); }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}