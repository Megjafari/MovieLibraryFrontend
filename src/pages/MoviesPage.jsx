import { useState, useCallback } from 'react';
import { tmdbApi, TMDB_IMG_W500 } from '../api/index.js';
import Hero from '../components/Hero.jsx';
import MovieRow from '../components/MovieRow.jsx';
import MovieCard from '../components/MovieCard.jsx';
import styles from '../App.module.css';

const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function MoviesPage({
  myMovies, reviews, myTitleSet, tmdbCache,
  openMovie, openBackendMovie, handleAddToList,
  tmdbTrending, tmdbPopular, tmdbTopRated,
  loadingBackend,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const enrichWithBackend = (tmdbList) =>
    tmdbList.map(t => {
      const be = myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(t.title));
      return be ? { ...t, _backendId: be.id } : t;
    });

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await tmdbApi.search(q);
      setSearchResults(res.results?.slice(0, 20) || []);
    } catch { setSearchResults([]); }
  };

  const heroTmdb = tmdbTrending[0] || null;
  const heroBackend = heroTmdb ? myMovies.find(m => normalizeTitle(m.title) === normalizeTitle(heroTmdb?.title)) : null;
  const heroInList = heroTmdb ? myTitleSet.has(normalizeTitle(heroTmdb?.title)) : false;

  return (
    <div>
      {!searchQuery && (
        <>
          <Hero
            tmdbMovie={heroTmdb}
            backendMovie={heroBackend}
            reviews={reviews}
            isInList={heroInList}
            onWatch={openMovie}
            onAdd={handleAddToList}
          />
          <MovieRow title="🔥 TRENDING THIS WEEK" movies={enrichWithBackend(tmdbTrending).slice(0, 14)} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={openMovie} />
          <MovieRow title="POPULAR RIGHT NOW" movies={enrichWithBackend(tmdbPopular).slice(0, 14)} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={openMovie} />
          <MovieRow title="ALL TIME TOP RATED" movies={enrichWithBackend(tmdbTopRated).slice(0, 14)} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={openMovie} />
        </>
      )}

      <div className={styles.page}>
        <div className={styles.searchWrap} style={{ padding: '20px 40px 0' }}>
          <input
            className={styles.searchInput}
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: '100%', maxWidth: '500px' }}
          />
        </div>

        {searchQuery && (
          <div className={styles.grid} style={{ padding: '20px 40px' }}>
            {searchResults.map(m => {
              const isInList = myTitleSet.has(normalizeTitle(m.title));
              const be = isInList ? myMovies.find(mv => normalizeTitle(mv.title) === normalizeTitle(m.title)) : null;
              const revs = be ? reviews.filter(r => r.movieId === be.id) : [];
              const avg = revs.length ? Math.round(revs.reduce((s, r) => s + r.rating, 0) / revs.length) : 0;
              return (
                <MovieCard key={m.id} movie={m} isInList={isInList} reviewCount={revs.length} avgRating={avg} onClick={openMovie} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}