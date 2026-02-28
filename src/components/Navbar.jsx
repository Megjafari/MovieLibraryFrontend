import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';


export default function Navbar({ scrolled, token, logout }) {
  const [genreOpen, setGenreOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
      <NavLink to="/" className={styles.logo}>MEGFLIX</NavLink>

      <div className={styles.tabs}>
        {[
          ['/movies', 'Movies'],
          ['/series', 'Series'],
          ['/anime', 'Anime'],
          ['/mylist', 'My List'],
          ['/reviews', 'Reviews'],
        ].map(([path, label]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
          >
            {label}
          </NavLink>
        ))}

      </div>

      <div className={styles.right}>
        {token ? (
          <button className={styles.tab} onClick={logout}>Logout</button>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}