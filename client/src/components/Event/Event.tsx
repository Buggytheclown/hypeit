import React from 'react';
import { EventItem } from './EventItem';
import { IEvent } from '../../interfaces';

import styles from './event.module.css';


const eventsList: IEvent[] = [
  {
    id: 1,
    title: 'Trarara',
    link: 'trarar',
    date: new Date(),
  },
  {
    id: 2,
    title: 'Trarara2',
    link: 'trarar',
    date: new Date(),
  },
  {
    id: 3,
    title: 'Trarara3',
    link: 'trarar',
    date: new Date(),
  },
  {
    id: 4,
    title: 'Trarara3',
    link: 'trarar',
    date: new Date(),
  },
  {
    id: 5,
    title: 'Trarara3',
    link: 'trarar',
    date: new Date(),
  },
];

export const Event = () => (
  <div className={styles.eventFeed}>
    <div className={styles.eventHeader}>
      <span className={styles.eventHeader__title}>15 Events in 2 week</span>
      <span className={styles.eventCard__time}>Today is 12 Fri</span>
    </div>
    <ul className={styles.eventItems}>
      {eventsList && eventsList.map((item: IEvent) => <EventItem key={item.id} item={item} />)}
    </ul>
  </div>
);
