import { useState } from 'react';
import { jikanApi } from '../api/index.js';
import Hero from '../components/Hero.jsx';
import MovieRow from '../components/MovieRow.jsx';
import MovieCard from '../components/MovieCard.jsx';
import styles from '../App.module.css';

const normalizeTitle = t => t?.toLowerCase().trim() ?? '';

export default function AnimePage({
  myMovies, reviews, myTitleSet,
  openAnime, handleAddToList,
  jikanTrending, jikanPopular, jikanTopRated,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await jikanApi.search(q);
      setSearchResults(res.data?.slice(0, 20) || []);
    } catch { setSearchResults([]); }
  };

  return (
    <div>
      {!searchQuery && (
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
            onWatch={(m) => openAnime(m)}
            onAdd={(m) => handleAddToList({ ...m, overview: m.synopsis })}
          />
          <MovieRow title="🔥 CURRENTLY AIRING" movies={jikanTrending.slice(0, 14).map(a => ({ id: a.mal_id, title: a.title, poster_path: null, _jikanImage: a.images?.jpg?.large_image_url, overview: a.synopsis, vote_average: a.score }))} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={openAnime} />
          <MovieRow title="MOST POPULAR ANIME" movies={jikanPopular.slice(0, 14).map(a => ({ id: a.mal_id, title: a.title, poster_path: null, _jikanImage: a.images?.jpg?.large_image_url, overview: a.synopsis, vote_average: a.score }))} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={openAnime} />
          <MovieRow title="⭐ TOP RATED ANIME" movies={jikanTopRated.slice(0, 14).map(a => ({ id: a.mal_id, title: a.title, poster_path: null, _jikanImage: a.images?.jpg?.large_image_url, overview: a.synopsis, vote_average: a.score }))} myMovieTitles={myTitleSet} reviews={reviews} onCardClick={openAnime} />
        </>
      )}

      <div className={styles.page}>
        <div style={{ padding: '20px 40px 0' }}>
          <input
            className={styles.searchInput}
            placeholder="Search anime..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: '100%', maxWidth: '500px' }}
          />
        </div>

        {searchQuery && (
          <div className={styles.grid} style={{ padding: '20px 40px' }}>
            {searchResults.map(a => {
              const m = { id: a.mal_id, title: a.title, poster_path: null, _jikanImage: a.images?.jpg?.large_image_url, overview: a.synopsis, vote_average: a.score };
              const isInList = myTitleSet.has(normalizeTitle(m.title));
              const be = isInList ? myMovies.find(mv => normalizeTitle(mv.title) === normalizeTitle(m.title)) : null;
              const revs = be ? reviews.filter(r => r.movieId === be.id) : [];
              const avg = revs.length ? Math.round(revs.reduce((s, r) => s + r.rating, 0) / revs.length) : 0;
              return <MovieCard key={m.id} movie={m} isInList={isInList} reviewCount={revs.length} avgRating={avg} onClick={() => openAnime(m)} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}