import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './feedFilter.module.css';

interface IFilterItems {
  id: number
  link: string
  title: string
}

const filterItems: IFilterItems[] = [
  {
    id: 1,
    link: 'bestof=1',
    title: 'Day',
  },
  {
    id: 2,
    link: 'bestof=7',
    title: 'Week',
  },
  {
    id: 3,
    link: 'bestof=30',
    title: 'Month',
  },
];

export const FeedFilter = () => (
  <div className={styles.feedFilter}>
    <ul>
      {filterItems && filterItems.map((item) => (
        <li key={item.id}>
          <NavLink to={`/?${item.link}`} activeClassName={styles.feedFilter__link_active} className={styles.feedFilter__link}>{item.title}</NavLink>
        </li>
      ))}

    </ul>
    <p className={styles.totalPosts}>(0/534)</p>
  </div>
);
