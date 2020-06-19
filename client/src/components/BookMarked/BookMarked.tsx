import React from 'react';
import { ReactComponent as Bookmarked } from '../../assets/img/icons/bookMarked.svg';
import { ReactComponent as BookmarkedActive } from '../../assets/img/icons/bookMarkedActive.svg';

import styles from './bookMarked.module.css';

export const BookMarked = ({ status = false }: { status: boolean }) => (
  <button type="button" className={styles.button}>
    {status ? <BookmarkedActive /> : <Bookmarked />}
  </button>
);
