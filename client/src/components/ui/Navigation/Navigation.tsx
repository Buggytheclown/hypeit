import React from 'react';

interface IProps {
  id: number;
  name: string;
  icon: React.ReactNode | null;
}

const Navigation: React.FC<[IProps]> = (navigations): React.ReactNode => {
  const navigationJSX = navigations.map((item) => (
    <li key={item.id} className="navigation__item">
      <p className="nav-item__title">{item.name}</p>
      <i className="nav-item__icon">{item.icon}</i>
    </li>
  ));
  return (
    <nav className="navigation">
      <ul>{navigationJSX}</ul>
    </nav>
  );
};

export default Navigation;
