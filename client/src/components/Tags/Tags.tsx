import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './tags.module.css';

interface IProps {
  id: number;
  name: string;
  link: string;
}

export const Tags = ({ tags }: {tags: IProps[]}) => (
  <ul className={styles.tags}>
    {tags && tags.map((item) => <li key={item.id}><NavLink to={`/?bestof=30&amp;tagName=${item.link}`}>{`#${item.name}`}</NavLink></li>)}
  </ul>
);
