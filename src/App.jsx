import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { backendApi, tmdbApi, jikanApi, TMDB_IMG_W500 } from './api/index.js';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import MovieModal from './components/MovieModal.jsx';
import EditMovieModal from './components/EditMovieModal.jsx';
import { useAuth } from './context/AuthContext.jsx';
import styles from './App.module.css';

import Home from './pages/Home.jsx';
import MoviesPage from './pages/MoviesPage.jsx';
import SeriesPage from './pages/SeriesPage.jsx';
import AnimePage from './pages/AnimePage.jsx';
import MyList from './pages/MyList.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function App() {
  const { token, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const [myMovies, setMyMovies] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [tmdbTrending, setTmdbTrending] = useState([]);
  const [tmdbPopular, setTmdbPopular] = useState([]);
  const [tmdbTopRated, setTmdbTopRated] = useState([]);

  const [tmdbTrendingTv, setTmdbTrendingTv] = useState([]);
  const [tmdbPopularTv, setTmdbPopularTv] = useState([]);
  const [tmdbTopRatedTv, setTmdbTopRatedTv] = useState([]);

  const [jikanTrending, setJikanTrending] = useState([]);
  const [jikanPopular, setJikanPopular] = useState([]);
  const [jikanTopRated, setJikanTopRated] = useState([]);

  const [tmdbCache, setTmdbCache] = useState({});
  const [selectedTmdb, setSelectedTmdb] = useState(null);
  const [selectedBackend, setSelectedBackend] = useState(null);
  const [editMovie, setEditMovie] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
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
      setTmdbTrending(tr.results || []);
      setTmdbPopular(po.results || []);
      setTmdbTopRated(top.results || []);
      setTmdbTrendingTv(trTv.results || []);
      setTmdbPopularTv(poTv.results || []);
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

      const firstAnime = tr.data?.[0];
      let tmdbBackdrop = null;
      if (firstAnime) {
        try {
          const res = await tmdbApi.searchTv(firstAnime.title_english || firstAnime.title);
          tmdbBackdrop = res.results?.[0]?.backdrop_path || null;
        } catch {}
      }

      setJikanTrending((tr.data || []).map((a, i) => i === 0 ? { ...a, _tmdbBackdrop: tmdbBackdrop } : a));
      setJikanPopular(po.data || []);
      setJikanTopRated(top.data || []);
    } catch {}
  };

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
        title: tmdbMovie.title,
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

  const sharedProps = {
    myMovies,
    reviews,
    myTitleSet,
    tmdbCache,
    openMovie,
    openBackendMovie,
    openAnime,
    handleAddToList,
    handleDeleteFromList,
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
    loadingBackend,
  };

  return (
    <div>
      <Navbar scrolled={scrolled} token={token} logout={logout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MoviesPage {...sharedProps} tmdbTrending={tmdbTrending} tmdbPopular={tmdbPopular} tmdbTopRated={tmdbTopRated} />} />
        <Route path="/series" element={<SeriesPage {...sharedProps} tmdbTrendingTv={tmdbTrendingTv} tmdbPopularTv={tmdbPopularTv} tmdbTopRatedTv={tmdbTopRatedTv} />} />
        <Route path="/anime" element={<AnimePage {...sharedProps} jikanTrending={jikanTrending} jikanPopular={jikanPopular} jikanTopRated={jikanTopRated} />} />
        <Route path="/mylist" element={<MyList {...sharedProps} handleEditMovie={handleEditMovie} />} />
        <Route path="/reviews" element={<ReviewsPage {...sharedProps} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

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