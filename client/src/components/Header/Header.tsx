import React from 'react';
import { ReactComponent as InformationIcon } from '../../assets/img/icons/inform.svg';
import { ReactComponent as FeedIcon } from '../../assets/img/icons/feed.svg';
import { ReactComponent as LoginIcon } from '../../assets/img/icons/login.svg';
import { ReactComponent as Bookmarked } from '../../assets/img/icons/bookMarkedActive.svg';
import { ReactComponent as Logout } from '../../assets/img/icons/logout.svg';
import styles from './header.module.css';
import { Navigation } from '../Navigation/Navigation';

const navigationItems = [
  {
    id: 1,
    name: 'About',
    path: 'about',
    icon: <InformationIcon />,
  },
  {
    id: 2,
    name: 'Feed',
    path: '/',
    icon: <FeedIcon />,
  },
  {
    id: 3,
    name: 'Auth',
    path: 'auth',
    icon: <LoginIcon />,
    size: 's',
  },
  {
    id: 4,
    name: 'BOOKMARKED',
    path: 'bookmarked',
    icon: <Bookmarked />,
  },
  {
    id: 5,
    name: 'Logout',
    path: '',
    icon: <Logout />,
  },
];

export const Header = () => (
  <header className={styles.header}>
    <div className={styles.header__container}>
      <Navigation navigations={navigationItems} />
    </div>
  </header>
);
