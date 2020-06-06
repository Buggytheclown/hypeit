import React from 'react';
import './navigation.modules.css';

interface IProps {
  id: number;
  name: string;
  icon: React.ReactNode;
}

export const Navigation = ({ navigations }: { navigations: IProps[] }) => {
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
