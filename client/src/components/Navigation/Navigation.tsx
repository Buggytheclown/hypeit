import React from 'react';
import './navigation.modules.css';

interface IProps {
  id: number;
  name: string;
  icon: React.ReactNode;
  size?: string;
}

export const Navigation = ({ navigations }: { navigations: IProps[] }) => {
  const navigationJSX = navigations.map((item) => (
    <li key={item.id} className="navigation__item">
      <a href="/" className="navigation__title">
        {item.name}
        {item.icon && (
          <i
            className={
              item.size
                ? `navigation__icon navigation__icon_${item.size}`
                : 'navigation__icon'
            }
          >
            {item.icon}
          </i>
        )}
      </a>
    </li>
  ));

  return (
    <nav className="navigation">
      <ul>{navigationJSX}</ul>
    </nav>
  );
};
