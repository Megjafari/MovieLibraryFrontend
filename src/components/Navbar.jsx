import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';

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

export default function Navbar({ activeTab, setTab, searchQuery, setSearchQuery, scrolled, onGenreSelect, activeGenre, token, logout }) {
  const [genreOpen, setGenreOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.solid : ''}`}>
      <div className={styles.logo} onClick={() => { setTab('home'); onGenreSelect(null); }}>MEGFLIX</div>

      <div className={styles.tabs}>
        {[
          ['home', 'Home'],
          ['series', 'Series'],
          ['movies', 'My List'],
          ['reviews', 'Reviews'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
            onClick={() => { setTab(id); onGenreSelect(null); }}
          >
            {label}
          </button>
        ))}

        <div className={styles.genreDropdown} ref={dropdownRef}>
          <button
            className={`${styles.tab} ${activeGenre ? styles.active : ''}`}
            onClick={() => setGenreOpen(v => !v)}
          >
            Genres ▾
          </button>
          {genreOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownGrid}>
                {GENRES.map(g => (
                  <button
                    key={g.id}
                    className={`${styles.dropdownItem} ${activeGenre === g.id ? styles.dropdownActive : ''}`}
                    onClick={() => {
                      onGenreSelect(g.id);
                      setTab('genre');
                      setGenreOpen(false);
                    }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search TMDB movies…"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setTab('search');
              else setTab('home');
            }}
          />
        </div>

        {token ? (
          <button className={styles.tab} onClick={logout}>Logout</button>
        ) : (
          <>
            <button className={`${styles.tab} ${activeTab === 'login' ? styles.active : ''}`} onClick={() => setTab('login')}>Login</button>
            <button className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`} onClick={() => setTab('register')}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}