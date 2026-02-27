// ─── BACKEND ──────────────────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_API_URL || '';

export const backendApi = {
  // Movies
  getMovies:   ()        => fetch(`${BACKEND_URL}/api/Movies`).then(r => { if (!r.ok) throw r; return r.json(); }),
  getMovie:    (id)      => fetch(`${BACKEND_URL}/api/Movies/${id}`).then(r => r.json()),
  createMovie: (body)    => fetch(`${BACKEND_URL}/api/Movies`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(async r => { if (!r.ok) throw r; const text = await r.text(); return text ? JSON.parse(text) : {}; }),
  updateMovie: (id,body) => fetch(`${BACKEND_URL}/api/Movies/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw r; }),
  deleteMovie: (id)      => fetch(`${BACKEND_URL}/api/Movies/${id}`, { method:'DELETE' }).then(r => { if (!r.ok) throw r; }),

  // Reviews
  getReviews: (token) => fetch(`${BACKEND_URL}/api/Reviews`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => { if (!r.ok) throw r; return r.json(); }),
  createReview: (body, token)    => fetch(`${BACKEND_URL}/api/Reviews`, { method:'POST', headers:{'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify(body) }).then(async r => { if (!r.ok) throw r; const text = await r.text(); return text ? JSON.parse(text) : {}; }),
  updateReview: (id, body, token) => fetch(`${BACKEND_URL}/api/Reviews/${id}`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw r; }),
  deleteReview: (id, token)      => fetch(`${BACKEND_URL}/api/Reviews/${id}`, { method:'DELETE', headers:{ Authorization: `Bearer ${token}`} }).then(r => { if (!r.ok) throw r; }),

  // Watchlist
  getWatchlist:        (token)          => fetch(`${BACKEND_URL}/api/watchlist`, { headers: { Authorization: `Bearer ${token}` } }).then(r => { if (!r.ok) throw r; return r.json(); }),
  addToWatchlist:      (movieId, token) => fetch(`${BACKEND_URL}/api/watchlist/${movieId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).then(r => { if (!r.ok) throw r; }),
  removeFromWatchlist: (movieId, token) => fetch(`${BACKEND_URL}/api/watchlist/${movieId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => { if (!r.ok) throw r; }),
};

// ─── TMDB ──────────────────────────────────────────────────────────────────────
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMG_ORIG = 'https://image.tmdb.org/t/p/original';
export const TMDB_IMG_W200 = 'https://image.tmdb.org/t/p/w200';

const tmdbFetch = (path) =>
  fetch(`${TMDB_BASE}${path}?api_key=${TMDB_KEY}&language=en-US`).then(r => r.json());

export const tmdbApi = {
  trending: ()   => tmdbFetch('/trending/movie/week'),
  popular:  ()   => tmdbFetch('/movie/popular'),
  topRated: ()   => tmdbFetch('/movie/top_rated'),
  details:  (id) => tmdbFetch(`/movie/${id}`),
  search:   (q)  => fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(q)}`).then(r => r.json()),
};