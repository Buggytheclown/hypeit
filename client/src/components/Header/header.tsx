import React from 'react';
import { ReactComponent as InformationIcon } from '../../assets/img/icons/inform.svg';

const navigation = [
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

const Header = () => {
  const navigationJSX = navigation.map((item) => (
    <li key={item.id} className="navigation__item">
      <p className="nav-item__title">{item.name}</p>
      <i className="nav-item__icon">{item.icon}</i>
    </li>
  ));
  return (
    <header className="header">
      <nav className="navigation">
        <ul>{navigationJSX}</ul>
      </nav>
    </header>
  );
};

export default Header;
