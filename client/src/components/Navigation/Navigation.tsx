import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';
import styles from './navigation.module.css';

interface IProps {
  id: number;
  name: string;
  icon: React.ReactNode;
  path?: string;
  size?: string;
}

export const Navigation = ({ navigations }: { navigations: IProps[] }) => {
  const navigationJSX = navigations.map((item) => {
    const iconClass = cx({
      [styles.navigation__icon]: true,
      [styles.navigation__icon_small]: item.size === 's',
    });

    return (
      <li key={item.id} className={styles.navigation__item}>
        {item.name === 'Logout' && <span>user</span>}
        <NavLink
          exact
          to={`${item.path}`}
          activeClassName={styles.navigation__title_active}
          className={styles.navigation__title}
        >
          {item.name}
          {item.icon && (
            <i className={iconClass}>
              {item.icon}
            </i>
          )}
        </NavLink>
      </li>
    );
  });

  return (
    <nav className={styles.navigation}>
      <ul>{navigationJSX}</ul>
    </nav>
  );
};
