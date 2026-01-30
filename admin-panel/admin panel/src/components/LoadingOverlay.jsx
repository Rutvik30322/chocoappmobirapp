import React from 'react';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay = ({ message = 'Loading...', show = false }) => {
  if (!show) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinnerLarge}></div>
        <p className={styles.loadingText}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
