import { useState } from 'react';
import { tmdbApi } from '../api/index.js';
import Hero from '../components/Hero.jsx';
import MovieRow from '../components/MovieRow.jsx';
import MovieCard from '../components/MovieCard.jsx';
import styles from '../App.module.css';

const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function SeriesPage({
  myMovies, reviews, myTitleSet,
  openMovie, handleAddToList,
  tmdbTrendingTv, tmdbPopularTv, tmdbTopRatedTv,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await tmdbApi.searchTv(q);
      setSearchResults(res.results?.slice(0, 20).map(m => ({ ...m, title: m.name || m.title })) || []);
    } catch { setSearchResults([]); }
  };

  return (
    <div>
      {!searchQuery && (
        <>
          <Hero
            tmdbMovie={tmdbTrendingTv[0] ? { ...tmdbTrendingTv[0], title: tmdbTrendingTv[0].name } : null}
            backendMovie={null}
            reviews={reviews}
            isInList={false}
            onWatch={(m) => openMovie({ ...m, title: m.name || m.title })}
            onAdd={(m) => handleAddToList({ ...m, title: m.name || m.title })}
          />
          <MovieRow title="🔥 TRENDING SERIES" movies={tmdbTrendingTv.slice(0, 14).map(m => ({ ...m, title: m.name || m.title }))} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={(m) => openMovie({ ...m, title: m.name || m.title })} />
          <MovieRow title="POPULAR SERIES" movies={tmdbPopularTv.slice(0, 14).map(m => ({ ...m, title: m.name || m.title }))} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={(m) => openMovie({ ...m, title: m.name || m.title })} />
          <MovieRow title="TOP RATED SERIES" movies={tmdbTopRatedTv.slice(0, 14).map(m => ({ ...m, title: m.name || m.title }))} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={(m) => openMovie({ ...m, title: m.name || m.title })} />
        </>
      )}

      <div className={styles.page}>
        <div style={{ padding: '20px 40px 0' }}>
          <input
            className={styles.searchInput}
            placeholder="Search series..."
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
                <MovieCard key={m.id} movie={m} isInList={isInList} reviewCount={revs.length} avgRating={avg} onClick={(m) => openMovie({ ...m, title: m.name || m.title })} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}