import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, [message]);

  if (!visible) return null;

  return (
    <div className={`${styles.toast} ${styles[type] || ''}`}>
      {message}
    </div>
  );
}