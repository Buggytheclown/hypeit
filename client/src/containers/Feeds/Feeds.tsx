import React from 'react';
import { Event } from '../../components/Event/Event';
import styles from './feeds.module.css';

export const Feeds = () => (
  <div className={styles.feed}>
    <Event />
  </div>
);
