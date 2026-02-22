import { useState, useEffect, useCallback, useRef } from 'react';
import { backendApi, tmdbApi, TMDB_IMG_W500 } from './api/index.js';
import Navbar        from './components/Navbar.jsx';
import Hero          from './components/Hero.jsx';
import MovieRow      from './components/MovieRow.jsx';
import MovieCard     from './components/MovieCard.jsx';
import MovieModal    from './components/MovieModal.jsx';
import EditMovieModal from './components/EditMovieModal.jsx';
import Toast         from './components/Toast.jsx';
import styles        from './App.module.css';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function App() {
  // ── State ──
  const [tab, setTab]                   = useState('home');
  const [scrolled, setScrolled]         = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  // Backend data
  const [myMovies,  setMyMovies]        = useState([]);
  const [reviews,   setReviews]         = useState([]);

  // TMDB data for rows
  const [tmdbTrending, setTmdbTrending] = useState([]);
  const [tmdbPopular,  setTmdbPopular]  = useState([]);
  const [tmdbTopRated, setTmdbTopRated] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // TMDB detail cache  title.lower → full tmdb object
  const [tmdbCache, setTmdbCache]       = useState({});

  // Modal
  const [selectedTmdb,    setSelectedTmdb]    = useState(null);
  const [selectedBackend, setSelectedBackend] = useState(null);
  const [editMovie,       setEditMovie]       = useState(null);

  // Toast
  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);

  // Loading
  const [loadingBackend, setLoadingBackend] = useState(true);

  // ── Computed ──
  // Set of lower-cased titles that are in the user's list
  const myTitleSet = new Set(myMovies.map(m => normalizeTitle(m.title)));

  // ── Toast helper ──
const showToast = (message, type = 'default') => {
  clearTimeout(toastTimer.current);
  setToast(null); // nollställ först
  setTimeout(() => {
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, 10); // liten delay så React hinner unmount/remount
};

  // ── Scroll ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Initial load ──
  useEffect(() => { loadBackend(); }, []);
  useEffect(() => { loadTmdbRows(); }, []);

  const loadBackend = async () => {
    setLoadingBackend(true);
    try {
      const [movs, revs] = await Promise.all([
        backendApi.getMovies(),
        backendApi.getReviews(),
      ]);
      setMyMovies(movs);
      setReviews(revs);
    } catch {
      showToast('⚠️ Kunde inte nå backend. Kör dotnet run?', 'error');
    }
    setLoadingBackend(false);
  };

  const loadTmdbRows = async () => {
    try {
      const [tr, po, top] = await Promise.all([
        tmdbApi.trending(),
        tmdbApi.popular(),
        tmdbApi.topRated(),
      ]);
      setTmdbTrending(tr.results  || []);
      setTmdbPopular( po.results  || []);
      setTmdbTopRated(top.results || []);
    } catch {
      // TMDB key not set – rows just stay empty
    }
  };

  // Enrich TMDB rows with backend _backendId for review counts
  const enrichWithBackend = useCallback((tmdbList) =>
    tmdbList.map(t => {
      const be = myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(t.title));
      return be ? { ...t, _backendId: be.id } : t;
    }), [myMovies]);

  // ── TMDB search ──
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await tmdbApi.search(searchQuery);
        setSearchResults(res.results?.slice(0, 20) || []);
      } catch { setSearchResults([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Open movie (from any card) ──
  const openMovie = async (tmdbMovie) => {
    // tmdbMovie might be partial (from row) – fetch details for genres etc.
    let full = tmdbCache[normalizeTitle(tmdbMovie.title)];
    if (!full && tmdbMovie.id) {
      try {
        full = await tmdbApi.details(tmdbMovie.id);
        setTmdbCache(prev => ({ ...prev, [normalizeTitle(full.title)]: full }));
      } catch { full = tmdbMovie; }
    }
    const beMovie = myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(tmdbMovie.title)) || null;
    setSelectedTmdb(full || tmdbMovie);
    setSelectedBackend(beMovie);
  };

  // When opening a movie that's only in our backend (no tmdb match passed)
  const openBackendMovie = async (beMovie) => {
    let tmdbData = tmdbCache[normalizeTitle(beMovie.title)];
    if (!tmdbData) {
      try {
        const res = await tmdbApi.search(beMovie.title);
        const match = res.results?.[0];
        if (match) {
          tmdbData = await tmdbApi.details(match.id);
          setTmdbCache(prev => ({ ...prev, [normalizeTitle(beMovie.title)]: tmdbData }));
        }
      } catch {}
    }
    setSelectedTmdb(tmdbData || null);
    setSelectedBackend(beMovie);
  };

  const closeModal = () => { setSelectedTmdb(null); setSelectedBackend(null); };

  // ── CRUD: Movies ──
  const handleAddToList = async (tmdbMovie) => {
    const key = normalizeTitle(tmdbMovie.title);
    if (myTitleSet.has(key)) {
      showToast('⚠️ Filmen finns redan i din lista!', 'error');
      return;
    }
    try {
      const body = {
        title:       tmdbMovie.title,
        description: tmdbMovie.overview || '',
        releaseDate: tmdbMovie.release_date || null,
      };
      const created = await backendApi.createMovie(body);
      setMyMovies(prev => [...prev, created]);
      setSelectedBackend(created);
      showToast('✅ Tillagd i din lista!', 'success');
    } catch { showToast('❌ Kunde inte lägga till film', 'error'); }
  };

  const handleEditMovie = async (id, data) => {
    try {
      await backendApi.updateMovie(id, data);
      setMyMovies(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
      showToast('✅ Film uppdaterad!', 'success');
    } catch { showToast('❌ Kunde inte uppdatera', 'error'); }
  };

  const handleDeleteFromList = async (id) => {
    if (!window.confirm('Ta bort filmen och alla dess recensioner?')) return;
    try {
      await backendApi.deleteMovie(id);
      setMyMovies(prev => prev.filter(m => m.id !== id));
      setReviews(prev  => prev.filter(r => r.movieId !== id));
      closeModal();
      showToast('🗑 Film borttagen');
    } catch { showToast('❌ Kunde inte ta bort', 'error'); }
  };

  // ── CRUD: Reviews ──
  const handleCreateReview = async (data) => {
    try {
      const created = await backendApi.createReview(data);
      setReviews(prev => [...prev, created]);
      showToast('⭐ Recension publicerad!', 'success');
    } catch { showToast('❌ Kunde inte spara recension', 'error'); }
  };

  const handleUpdateReview = async (id, data) => {
    try {
      await backendApi.updateReview(id, data);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      showToast('✅ Recension uppdaterad!', 'success');
    } catch { showToast('❌ Kunde inte uppdatera recension', 'error'); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Ta bort recensionen?')) return;
    try {
      await backendApi.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast('🗑 Recension borttagen');
    } catch { showToast('❌ Kunde inte ta bort recension', 'error'); }
  };

  // ── Hero data ──
  // Pick first trending movie as hero
  const heroTmdb    = tmdbTrending[0] || null;
  const heroBackend = heroTmdb ? myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(heroTmdb?.title)) : null;
  const heroInList  = heroTmdb ? myTitleSet.has(normalizeTitle(heroTmdb?.title)) : false;

  // My list enriched with TMDB poster data
  const myMoviesEnriched = myMovies.map(m => {
    const td = tmdbCache[normalizeTitle(m.title)] ||
               tmdbTrending.find(t => normalizeTitle(t.title) === normalizeTitle(m.title)) ||
               tmdbPopular.find(t  => normalizeTitle(t.title) === normalizeTitle(m.title));
    return td ? { ...m, poster_path: td.poster_path, vote_average: td.vote_average, release_date: td.release_date || m.releaseDate } : m;
  });

  // Top rated from my list
  const myTopRated = [...myMoviesEnriched]
    .map(m => {
      const revs = reviews.filter(r => r.movieId === m.id);
      const avg  = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 0;
      return { ...m, _avg: avg, _reviewCount: revs.length };
    })
    .filter(m => m._reviewCount > 0)
    .sort((a, b) => b._avg - a._avg)
    .slice(0, 12);

  return (
    <div>
      <Navbar
        activeTab={tab}
        setTab={t => { setTab(t); if (t !== 'search') setSearchQuery(''); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrolled={scrolled}
      />

      {/* ── HOME ── */}
      {tab === 'home' && (
        <>
          <Hero
            tmdbMovie={heroTmdb}
            backendMovie={heroBackend}
            reviews={reviews}
            isInList={heroInList}
            onWatch={openMovie}
            onAdd={handleAddToList}
          />

          {myMoviesEnriched.length > 0 && (
            <MovieRow
              title="MIN LISTA"
              movies={myMoviesEnriched}
              myMovieTitles={myTitleSet}
              reviews={reviews}
              onCardClick={m => openBackendMovie(m)}
            />
          )}

          <MovieRow
            title="🔥 TRENDING DEN HÄR VECKAN"
            movies={enrichWithBackend(tmdbTrending).slice(0, 14)}
            myMovieTitles={myTitleSet}
            reviews={reviews}
            onCardClick={openMovie}
          />

          {myTopRated.length > 0 && (
            <MovieRow
              title="⭐ DINA HÖGST BETYGSATTA"
              movies={myTopRated}
              myMovieTitles={myTitleSet}
              reviews={reviews}
              onCardClick={m => openBackendMovie(m)}
            />
          )}

          <MovieRow
            title="POPULÄRT JUST NU"
            movies={enrichWithBackend(tmdbPopular).slice(0, 14)}
            myMovieTitles={myTitleSet}
            reviews={reviews}
            onCardClick={openMovie}
          />

          <MovieRow
            title="HÖGST BETYGSATT GENOM TIDERNA"
            movies={enrichWithBackend(tmdbTopRated).slice(0, 14)}
            myMovieTitles={myTitleSet}
            reviews={reviews}
            onCardClick={openMovie}
          />
        </>
      )}

      {/* ── MY LIST ── */}
      {tab === 'movies' && (
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>MIN LISTA</h1>
            <span className={styles.pageCount}>{myMovies.length} filmer</span>
          </div>
          {loadingBackend ? (
            <div className={styles.loadingCenter}><span className={styles.spinner} /></div>
          ) : myMoviesEnriched.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎬</div>
              <p>Din lista är tom.</p>
              <p>Bläddra bland filmerna och lägg till dina favoriter!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {myMoviesEnriched.map(m => {
                const revs = reviews.filter(r => r.movieId === m.id);
                const avg  = revs.length ? Math.round(revs.reduce((s,r) => s+r.rating,0)/revs.length) : 0;
                return (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    isInList={true}
                    reviewCount={revs.length}
                    avgRating={avg}
                    onClick={() => openBackendMovie(m)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab === 'reviews' && (
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>RECENSIONER</h1>
            <span className={styles.pageCount}>{reviews.length} totalt</span>
          </div>
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⭐</div>
              <p>Inga recensioner ännu.</p>
              <p>Öppna en film i din lista och recensera!</p>
            </div>
          ) : (
            <div className={styles.reviewsPage}>
              {[...reviews].reverse().map(r => {
                const movie = myMovies.find(m => m.id === r.movieId);
                return (
                  <div key={r.id} className={styles.reviewItem}>
                    <div
                      className={styles.reviewMovieTitle}
                      onClick={() => movie && openBackendMovie(movie)}
                    >
                      {movie?.title || 'Okänd film'} →
                    </div>
                    <div className={styles.reviewCard}>
                      <div className={styles.reviewTop}>
                        <div className={styles.reviewAvatar}>R{r.id}</div>
                        <div className={styles.reviewStars}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          <span className={styles.reviewScore}>{r.rating}/5</span>
                        </div>
                        <div className={styles.reviewBtns}>
                          <button
                            className={styles.rEditBtn}
                            onClick={() => movie && openBackendMovie(movie)}
                            title="Redigera (öppna film)"
                          >✏️</button>
                          <button
                            className={styles.rDelBtn}
                            onClick={() => handleDeleteReview(r.id)}
                            title="Ta bort"
                          >🗑</button>
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
      )}

      {/* ── SEARCH ── */}
      {tab === 'search' && (
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              SÖK: <span className={styles.searchTerm}>"{searchQuery}"</span>
            </h1>
            <span className={styles.pageCount}>{searchResults.length} resultat</span>
          </div>
          {searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>Inga resultat. Prova ett annat sökord.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {searchResults.map(m => {
                const isInList = myTitleSet.has(normalizeTitle(m.title));
                const be       = isInList ? myMovies.find(mv => normalizeTitle(mv.title) === normalizeTitle(m.title)) : null;
                const revs     = be ? reviews.filter(r => r.movieId === be.id) : [];
                const avg      = revs.length ? Math.round(revs.reduce((s,r) => s+r.rating,0)/revs.length) : 0;
                return (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    isInList={isInList}
                    reviewCount={revs.length}
                    avgRating={avg}
                    onClick={openMovie}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {(selectedTmdb || selectedBackend) && (
        <MovieModal
          tmdbMovie={selectedTmdb}
          backendMovie={selectedBackend}
          reviews={reviews}
          isInList={!!selectedBackend}
          onClose={closeModal}
          onAddToList={handleAddToList}
          onDeleteFromList={handleDeleteFromList}
          onCreateReview={handleCreateReview}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
          onEditMovie={m => { closeModal(); setEditMovie(m); }}
        />
      )}

      {editMovie && (
        <EditMovieModal
          movie={editMovie}
          onSave={handleEditMovie}
          onClose={() => setEditMovie(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
