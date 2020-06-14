import React from 'react';
import { NavLink } from 'react-router-dom';
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
    let iconStyle: string;

    switch (item.size) {
      case 's':
        iconStyle = [
          styles.navigation__icon,
          styles.navigation__icon_small,
        ].join(' ');
        break;
      default:
        iconStyle = '';
    }
    return (
      <li key={item.id} className={styles.navigation__item}>
        <NavLink
          exact
          to={`${item.path}`}
          activeClassName={styles.navigation__title_active}
          className={styles.navigation__title}
        >
          {item.name}
          {item.icon && (
            <i className={item.size ? iconStyle : `${styles.navigation__icon}`}>
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
