import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './feedFilter.module.css';

export const FeedFilter = () => (
  <div className={styles.feedFilter}>
    <NavLink to="/?bestof=1" activeClassName={styles.feedFilter__link_active} className={styles.feedFilter__link}>Day</NavLink>
    <NavLink to="/?bestof=7" activeClassName={styles.feedFilter__link_active} className={styles.feedFilter__link}>Week</NavLink>
    <NavLink to="/?bestof=30" activeClassName={styles.feedFilter__link_active} className={styles.feedFilter__link}>Month</NavLink>
    <p className={styles.totalPosts}>(0/534)</p>
  </div>
);
