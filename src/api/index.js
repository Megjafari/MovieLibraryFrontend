// ─── BACKEND ──────────────────────────────────────────────────────────────────
// Vite proxar /api → https://localhost:7000/api via vite.config.js
// Byt port i vite.config.js om din backend kör på annan port

export const backendApi = {
  // Movies
  getMovies:   ()        => fetch('/api/Movies').then(r => { if (!r.ok) throw r; return r.json(); }),
  getMovie:    (id)      => fetch(`/api/Movies/${id}`).then(r => r.json()),
  createMovie: (body) => fetch('/api/Movies', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(async r => { if (!r.ok) throw r; const text = await r.text(); return text ? JSON.parse(text) : {}; }),
  updateMovie: (id,body) => fetch(`/api/Movies/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw r; }),
  deleteMovie: (id)      => fetch(`/api/Movies/${id}`, { method:'DELETE' }).then(r => { if (!r.ok) throw r; }),

  // Reviews
  getReviews:   ()        => fetch('/api/Reviews').then(r => { if (!r.ok) throw r; return r.json(); }),
  createReview: (body) => fetch('/api/Reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(async r => { if (!r.ok) throw r; const text = await r.text(); return text ? JSON.parse(text) : {}; }),
  updateReview: (id,body) => fetch(`/api/Reviews/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw r; }),
  deleteReview: (id)      => fetch(`/api/Reviews/${id}`, { method:'DELETE' }).then(r => { if (!r.ok) throw r; }),
};

// ─── TMDB ──────────────────────────────────────────────────────────────────────
// Skaffa gratis API-nyckel på: https://www.themoviedb.org/settings/api
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export const TMDB_IMG_W500    = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMG_ORIG    = 'https://image.tmdb.org/t/p/original';
export const TMDB_IMG_W200    = 'https://image.tmdb.org/t/p/w200';

const tmdbFetch = (path) =>
  fetch(`${TMDB_BASE}${path}?api_key=${TMDB_KEY}&language=sv-SE`).then(r => r.json());

export const tmdbApi = {
  trending:  ()    => tmdbFetch('/trending/movie/week'),
  popular:   ()    => tmdbFetch('/movie/popular'),
  topRated:  ()    => tmdbFetch('/movie/top_rated'),
  details:   (id)  => tmdbFetch(`/movie/${id}`),
  search:    (q)   => fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=sv-SE&query=${encodeURIComponent(q)}`).then(r => r.json()),
};
