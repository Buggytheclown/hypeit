import React from 'react';
import { ReactComponent as InformationIcon } from '../../assets/img/icons/inform.svg';
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
    icon: null,
  },
  {
    id: 3,
    name: 'Auth',
    icon: null,
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
