import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.home}>
      <h1 className={styles.logo}>MEGFLIX</h1>
      <p className={styles.tagline}>Your personal movie, series & anime library</p>
      <div className={styles.buttons}>
        <button className={styles.btn} onClick={() => navigate('/movies')}>Movies</button>
        <button className={styles.btn} onClick={() => navigate('/series')}>Series</button>
        <button className={styles.btn} onClick={() => navigate('/anime')}>Anime</button>
        <button className={styles.btn} onClick={() => navigate('/mylist')}>My List</button>
      </div>
    </div>
  );
}