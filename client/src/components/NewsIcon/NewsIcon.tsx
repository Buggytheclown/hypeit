import React from 'react';
import FaviconDev from '../../assets/img/icons/favicon-dev.png';
import FaviconMedium from '../../assets/img/icons/favicon-medium.png';
import FaviconHabr from '../../assets/img/icons/favicon-habr.png';
import styles from './newsIcon.module.css';

export const NewsIcon = ({ type }: { type: string}) => {
  switch (type) {
    case 'dev':
      return <img className={styles.newsIcon} src={FaviconDev} alt={type} />;
    case 'medium':
      return <img className={styles.newsIcon} src={FaviconMedium} alt={type} />;
    case 'habr':
      return <img className={styles.newsIcon} src={FaviconHabr} alt={type} />;
    default:
      return null;
  }
};
