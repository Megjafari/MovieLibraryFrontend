import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ activeTab, setTab, searchQuery, setSearchQuery, scrolled }) {
  return (
    <nav className={`${styles.nav} ${scrolled ? styles.solid : ''}`}>
      <div className={styles.logo} onClick={() => setTab('home')}>MEGFLIX</div>

      <div className={styles.tabs}>
        {[
          ['home',    'Hem'],
          ['movies',  'Min lista'],
          ['reviews', 'Recensioner'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Sök bland TMDB-filmer…"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setTab('search');
              else setTab('home');
            }}
          />
        </div>
        <button className={styles.addBtn} onClick={() => setTab('add')}>
          <span>+</span> Lägg till film
        </button>
      </div>
    </nav>
  );
}
