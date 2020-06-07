import React from 'react';
import { ReactComponent as InformationIcon } from '../../assets/img/icons/inform.svg';
import { ReactComponent as FeedIcon } from '../../assets/img/icons/feed.svg';
import { ReactComponent as LoginIcon } from '../../assets/img/icons/login.svg';
import './header.modules.css';
import { Navigation } from '../Navigation/Navigation';

const navigationItems = [
  {
    id: 1,
    name: 'About',
    icon: <InformationIcon />,
  },
  {
    id: 2,
    name: 'Feed',
    icon: <FeedIcon />,
  },
  {
    id: 3,
    name: 'Auth',
    icon: <LoginIcon />,
    size: 's',
  },
];

const Header = () => (
  <header className="header">
    <div className="header__container">
      <Navigation navigations={navigationItems} />
    </div>
  </header>
);

export default Header;
