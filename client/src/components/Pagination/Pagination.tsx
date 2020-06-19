import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './pagination.module.css';

export const Pagination = ({ count = 1 }: { count: number }) => (
  <div className={styles.pagination}>
    <NavLink to="?isNextPage=false&amp;bestof=7&amp;page=1">&lt;&lt;&lt;</NavLink>
    <span className={styles.paginationCount}>{count}</span>
    <NavLink to="?isNextPage=false&amp;bestof=7&amp;page=3">&gt;&gt;&gt;</NavLink>
  </div>
);
