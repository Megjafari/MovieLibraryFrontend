import { useState, useEffect, useCallback, useRef } from 'react';
import { backendApi, tmdbApi, jikanApi, TMDB_IMG_W500 } from './api/index.js';
import Navbar        from './components/Navbar.jsx';
import Hero          from './components/Hero.jsx';
import MovieRow      from './components/MovieRow.jsx';
import MovieCard     from './components/MovieCard.jsx';
import MovieModal    from './components/MovieModal.jsx';
import EditMovieModal from './components/EditMovieModal.jsx';
import Toast         from './components/Toast.jsx';
import styles        from './App.module.css';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './context/AuthContext.jsx';



const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
];

const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function App() {
  const [tab, setTab]                   = useState('home');
  const { token, logout } = useAuth();
  const [scrolled, setScrolled]         = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');


  const [activeGenre, setActiveGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loadingGenre, setLoadingGenre] = useState(false);

  const handleGenreSelect = async (genreId) => {
  setActiveGenre(genreId);
  if (!genreId) return;
  setLoadingGenre(true);
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_KEY}&language=en-US&with_genres=${genreId}&sort_by=popularity.desc`
    );
    const data = await res.json();
    setGenreMovies(data.results || []);
  } catch {
    setGenreMovies([]);
  }
  setLoadingGenre(false);
};
    //anime
  const [jikanTrending, setJikanTrending] = useState([]);
  const [jikanPopular, setJikanPopular] = useState([]);
  const [jikanTopRated, setJikanTopRated] = useState([]);

  const [myMovies,  setMyMovies]        = useState([]);
  const [reviews,   setReviews]         = useState([]);

  const [tmdbTrending, setTmdbTrending] = useState([]);
  const [tmdbPopular,  setTmdbPopular]  = useState([]);
  const [tmdbTopRated, setTmdbTopRated] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [tmdbTrendingTv, setTmdbTrendingTv] = useState([]);
  const [tmdbPopularTv, setTmdbPopularTv] = useState([]);
  const [tmdbTopRatedTv, setTmdbTopRatedTv] = useState([]);

  const [tmdbCache, setTmdbCache]       = useState({});

  const [selectedTmdb,    setSelectedTmdb]    = useState(null);
  const [selectedBackend, setSelectedBackend] = useState(null);
  const [editMovie,       setEditMovie]       = useState(null);

  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);

  const [loadingBackend, setLoadingBackend] = useState(true);

  const myTitleSet = new Set(myMovies.map(m => normalizeTitle(m.title)));

  const showToast = (message, type = 'default') => {
    clearTimeout(toastTimer.current);
    setToast(null);
    setTimeout(() => {
      setToast({ message, type });
      toastTimer.current = setTimeout(() => setToast(null), 3200);
    }, 10);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { loadBackend(); }, [token]);
  useEffect(() => { loadTmdbRows(); }, []);
  useEffect(() => { loadAnime(); }, []);

  const loadBackend = async () => {
    if (!token) {
      setMyMovies([]);
      setReviews([]);
      setLoadingBackend(false);
      return;
    }
    setLoadingBackend(true);
    try {
      const [movs, revs] = await Promise.all([
        backendApi.getWatchlist(token),
        backendApi.getReviews(token),
      ]);
      setMyMovies(movs);
      setReviews(revs);
    } catch {
      showToast('⚠️ Could not reach backend.', 'error');
    }
    setLoadingBackend(false);
  };

  const loadTmdbRows = async () => {
    try {
      const [tr, po, top, trTv, poTv, topTv] = await Promise.all([
        tmdbApi.trending(),
        tmdbApi.popular(),
        tmdbApi.topRated(),
        tmdbApi.trendingTv(),
        tmdbApi.popularTv(),
        tmdbApi.topRatedTv(),
      ]);
      setTmdbTrending(tr.results  || []);
      setTmdbPopular( po.results  || []);
      setTmdbTopRated(top.results || []);
      setTmdbTrendingTv(trTv.results || []);
      setTmdbPopularTv(poTv.results  || []);
      setTmdbTopRatedTv(topTv.results || []);
    } catch {}
  };
const loadAnime = async () => {
  try {
    const tr = await jikanApi.trending();
    await new Promise(r => setTimeout(r, 1000));
    const po = await jikanApi.popular();
    await new Promise(r => setTimeout(r, 1000));
    const top = await jikanApi.topRated();

    const enrichWithTmdb = async (animeList) => {
      return await Promise.all(
        animeList.data.slice(0, 14).map(async (a) => {
          try {
            const res = await tmdbApi.searchTv(a.title_english || a.title);
            const match = res.results?.[0];
            return {
              ...a,
              _tmdbBackdrop: match?.backdrop_path || null,
              _tmdbPoster: match?.poster_path || null,
            };
          } catch {
            return a;
          }
        })
      );
    };

    const [enrichedTr, enrichedPo, enrichedTop] = await Promise.all([
      enrichWithTmdb(tr),
      enrichWithTmdb(po),
      enrichWithTmdb(top),
    ]);

    setJikanTrending(enrichedTr);
    setJikanPopular(enrichedPo);
    setJikanTopRated(enrichedTop);
  } catch {}
};

  const enrichWithBackend = useCallback((tmdbList) =>
    tmdbList.map(t => {
      const be = myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(t.title));
      return be ? { ...t, _backendId: be.id } : t;
    }), [myMovies]);

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

  const openMovie = async (tmdbMovie) => {
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
  const openAnime = (animeData) => {
    setSelectedTmdb({
      title: animeData.title,
      overview: animeData.overview || animeData.synopsis,
      poster_path: null,
      backdrop_path: null,
      _jikanImage: animeData._jikanImage,
      vote_average: animeData.vote_average,
    });
    setSelectedBackend(null);
  };

  const closeModal = () => { setSelectedTmdb(null); setSelectedBackend(null); };

  const handleAddToList = async (tmdbMovie) => {
    if (!token) {
      showToast('⚠️ You must be logged in to add movies!', 'error');
      return;
    }
    const key = normalizeTitle(tmdbMovie.title);
    if (myTitleSet.has(key)) {
      showToast('⚠️ Already in your list!', 'error');
      return;
    }
    try {
      const body = {
        title:       tmdbMovie.title,
        description: tmdbMovie.overview || '',
        releaseDate: tmdbMovie.release_date || tmdbMovie.first_air_date || null,
      };
      const created = await backendApi.createMovie(body);
      await backendApi.addToWatchlist(created.id, token);
      setMyMovies(prev => [...prev, created]);
      setSelectedBackend(created);
      showToast('✅ Added to your list!', 'success');
    } catch { showToast('❌ Could not add movie', 'error'); }
  };

  const handleEditMovie = async (id, data) => {
    try {
      await backendApi.updateMovie(id, data);
      setMyMovies(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
      showToast('✅ Movie updated!', 'success');
    } catch { showToast('❌ Could not update', 'error'); }
  };

  const handleDeleteFromList = async (id) => {
    if (!window.confirm('Remove movie from your list?')) return;
    try {
      await backendApi.removeFromWatchlist(id, token);
      setMyMovies(prev => prev.filter(m => m.id !== id));
      setReviews(prev => prev.filter(r => r.movieId !== id));
      closeModal();
      showToast('🗑 Movie removed');
    } catch { showToast('❌ Could not remove', 'error'); }
  };

  const handleCreateReview = async (data) => {
  try {
    const created = await backendApi.createReview(data, token);
    setReviews(prev => [...prev, created]);
    showToast('⭐ Review published!', 'success');
  } catch { showToast('❌ Could not save review', 'error'); }
};

const handleUpdateReview = async (id, data) => {
  try {
    await backendApi.updateReview(id, data, token);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    showToast('✅ Review updated!', 'success');
  } catch { showToast('❌ Could not update review', 'error'); }
};

const handleDeleteReview = async (id) => {
  if (!window.confirm('Delete this review?')) return;
  try {
    await backendApi.deleteReview(id, token);
    setReviews(prev => prev.filter(r => r.id !== id));
    showToast('🗑 Review deleted');
  } catch { showToast('❌ Could not delete review', 'error'); }
};

  const heroTmdb    = tmdbTrending[0] || null;
  const heroBackend = heroTmdb ? myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(heroTmdb?.title)) : null;
  const heroInList  = heroTmdb ? myTitleSet.has(normalizeTitle(heroTmdb?.title)) : false;

  const myMoviesEnriched = myMovies.map(m => {
    const td = tmdbCache[normalizeTitle(m.title)] ||
               tmdbTrending.find(t => normalizeTitle(t.title) === normalizeTitle(m.title)) ||
               tmdbPopular.find(t  => normalizeTitle(t.title) === normalizeTitle(m.title));
    return td ? { ...m, poster_path: td.poster_path, vote_average: td.vote_average, release_date: td.release_date || m.releaseDate } : m;
  });

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
          onGenreSelect={handleGenreSelect}
          activeGenre={activeGenre}
          token={token}
          logout={logout}
        />

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
              title="MY LIST"
              movies={myMoviesEnriched}
              myMovieTitles={myTitleSet}
              reviews={reviews}
              onCardClick={m => openBackendMovie(m)}
            />
          )}

          <MovieRow
            title="🔥 TRENDING THIS WEEK"
            movies={enrichWithBackend(tmdbTrending).slice(0, 14)}
            myMovieTitles={myTitleSet}
            reviews={reviews}
            onCardClick={openMovie}
          />

          {myTopRated.length > 0 && (
            <MovieRow
              title="⭐ YOUR TOP RATED"
              movies={myTopRated}
              myMovieTitles={myTitleSet}
              reviews={reviews}
              onCardClick={m => openBackendMovie(m)}
            />
          )}

          <MovieRow
            title="POPULAR RIGHT NOW"
            movies={enrichWithBackend(tmdbPopular).slice(0, 14)}
            myMovieTitles={myTitleSet}
            reviews={reviews}
            onCardClick={openMovie}
          />

          <MovieRow
            title="ALL TIME TOP RATED"
            movies={enrichWithBackend(tmdbTopRated).slice(0, 14)}
            myMovieTitles={myTitleSet}
            reviews={reviews}
            onCardClick={openMovie}
          />
        </>
      )}

      {tab === 'movies' && (
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>MY LIST</h1>
            <span className={styles.pageCount}>{myMovies.length} movies</span>
          </div>
          {loadingBackend ? (
            <div className={styles.loadingCenter}><span className={styles.spinner} /></div>
          ) : myMoviesEnriched.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎬</div>
              <p>Your list is empty.</p>
              <p>Browse movies and add your favorites!</p>
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

      {tab === 'reviews' && (
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
                    <div
                      className={styles.reviewMovieTitle}
                      onClick={() => movie && openBackendMovie(movie)}
                    >
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
                          <button
                            className={styles.rEditBtn}
                            onClick={() => movie && openBackendMovie(movie)}
                            title="Edit (open movie)"
                          >✏️</button>
                          <button
                            className={styles.rDelBtn}
                            onClick={() => handleDeleteReview(r.id)}
                            title="Delete"
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

      {tab === 'search' && (
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              SEARCH: <span className={styles.searchTerm}>"{searchQuery}"</span>
            </h1>
            <span className={styles.pageCount}>{searchResults.length} results</span>
          </div>
          {searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>No results. Try a different search term.</p>
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


          {tab === 'genre' && (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            {GENRES.find(g => g.id === activeGenre)?.name?.toUpperCase()}
          </h1>
          <span className={styles.pageCount}>{genreMovies.length} movies</span>
        </div>
        {loadingGenre ? (
          <div className={styles.loadingCenter}><span className={styles.spinner} /></div>
        ) : (
          <div className={styles.grid}>
            {genreMovies.map(m => {
              const isInList = myTitleSet.has(normalizeTitle(m.title));
              const be = isInList ? myMovies.find(mv => normalizeTitle(mv.title) === normalizeTitle(m.title)) : null;
              const revs = be ? reviews.filter(r => r.movieId === be.id) : [];
              const avg = revs.length ? Math.round(revs.reduce((s,r) => s+r.rating,0)/revs.length) : 0;
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

    {tab === 'series' && (
    <>
    <Hero
      tmdbMovie={tmdbTrendingTv[0] ? { ...tmdbTrendingTv[0], title: tmdbTrendingTv[0].name } : null}
      backendMovie={null}
      reviews={reviews}
      isInList={false}
      onWatch={(m) => openMovie({ ...m, title: m.name || m.title })}
      onAdd={(m) => handleAddToList({ ...m, title: m.name || m.title })}
    />

    <MovieRow
      title="🔥 TRENDING SERIES"
      movies={tmdbTrendingTv.slice(0, 14).map(m => ({ ...m, title: m.name || m.title }))}
      myMovieTitles={myTitleSet}
      reviews={reviews}
      onCardClick={(m) => openMovie({ ...m, title: m.name || m.title })}
    />

    <MovieRow
      title="POPULAR SERIES"
      movies={tmdbPopularTv.slice(0, 14).map(m => ({ ...m, title: m.name || m.title }))}
      myMovieTitles={myTitleSet}
      reviews={reviews}
      onCardClick={(m) => openMovie({ ...m, title: m.name || m.title })}
    />

    <MovieRow
      title="TOP RATED SERIES"
      movies={tmdbTopRatedTv.slice(0, 14).map(m => ({ ...m, title: m.name || m.title }))}
      myMovieTitles={myTitleSet}
      reviews={reviews}
      onCardClick={(m) => openMovie({ ...m, title: m.name || m.title })}
          />
        </>
      )}
      {tab === 'anime' && (
    <>
    <Hero
      tmdbMovie={jikanTrending[0] ? {
        title: jikanTrending[0].title,
        overview: jikanTrending[0].synopsis,
        backdrop_path: jikanTrending[0]._tmdbBackdrop || null,
        poster_path: jikanTrending[0]._tmdbPoster || null,
        _jikanImage: jikanTrending[0].images?.jpg?.large_image_url,
      } : null}
      backendMovie={null}
      reviews={reviews}
      isInList={false}
      onWatch={(m) => openMovie(m)}
      onAdd={(m) => handleAddToList(m)}
    />
    <MovieRow
      title="🔥 CURRENTLY AIRING"
      movies={jikanTrending.slice(0, 14).map(a => ({
        id: a.mal_id,
        title: a.title,
        poster_path: null,
        _jikanImage: a.images?.jpg?.large_image_url,
        overview: a.synopsis,
        vote_average: a.score,
      }))}
      myMovieTitles={myTitleSet}
      reviews={reviews}
      onCardClick={(m) => openAnime(m)}
    />

    <MovieRow
      title="MOST POPULAR ANIME"
      movies={jikanPopular.slice(0, 14).map(a => ({
        id: a.mal_id,
        title: a.title,
        poster_path: null,
        _jikanImage: a.images?.jpg?.large_image_url,
        overview: a.synopsis,
        vote_average: a.score,
      }))}
      myMovieTitles={myTitleSet}
      reviews={reviews}
      onCardClick={(m) => openAnime(m)} 
    />

    <MovieRow
      title="⭐ TOP RATED ANIME"
      movies={jikanTopRated.slice(0, 14).map(a => ({
        id: a.mal_id,
        title: a.title,
        poster_path: null,
        _jikanImage: a.images?.jpg?.large_image_url,
        overview: a.synopsis,
        vote_average: a.score,
      }))}
      myMovieTitles={myTitleSet}
      reviews={reviews}
      onCardClick={(m) => openAnime(m)}
        />
      </>
    )}

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

      {tab === 'login' && <Login setTab={setTab} />}
      {tab === 'register' && <Register setTab={setTab} />}

    </div>
  );
}
