import React from 'react';
import { IEvent } from '../../interfaces';

import styles from './eventItem.module.css';

export const EventItem = ({ item }: { item: IEvent}) => (
  <li className={styles.eventItem}>
    <div className={styles.eventItem__time}>
      <span>12 Fri</span>
      <span>June 17:00</span>
    </div>
    <div className={styles.eventItem__title}>
      <a href="https://events.dev.by/imaguru-news--2" target="_blank" rel="noopener noreferrer">{item.title}</a>
    </div>
  </li>
);
