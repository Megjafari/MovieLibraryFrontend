import styles from './StarRating.module.css';

export default function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className={`${styles.stars} ${readonly ? styles.readonlyGroup : ''}`}>
      {[5, 4, 3, 2, 1].map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= value ? styles.filled : ''} ${readonly ? styles.readonly : ''}`}
          onClick={() => !readonly && onChange?.(n)}
          disabled={readonly}
          aria-label={`${n} stjärnor`}
        >
          ★
        </button>
      ))}
      {!readonly && value > 0 && (
        <span className={styles.label}>{value}/5</span>
      )}
    </div>
  );
}