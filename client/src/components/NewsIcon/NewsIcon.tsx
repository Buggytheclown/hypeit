import React from 'react';
import FaviconDev from '../../assets/img/icons/favicon-dev.png';
import FaviconMedium from '../../assets/img/icons/favicon-medium.png';
import FaviconHabr from '../../assets/img/icons/favicon-habr.png';
import styles from './newsIcon.module.css';
import { NewsType } from '../../types';

export const NewsIcon = ({ type }: { type: string}) => {
  switch (type) {
    case NewsType.DEV:
      return <img className={styles.newsIcon} src={FaviconDev} alt={type} />;
    case NewsType.MEDIUM:
      return <img className={styles.newsIcon} src={FaviconMedium} alt={type} />;
    case NewsType.HABR:
      return <img className={styles.newsIcon} src={FaviconHabr} alt={type} />;
    default:
      return null;
  }
};
