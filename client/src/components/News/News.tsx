import React from 'react';
import { Tags } from '../Tags/Tags';
import { ReactComponent as Favorite } from '../../assets/img/icons/favorite.svg';
import { NewsIcon } from '../NewsIcon/NewsIcon';
import { INews } from '../../interfaces/index';
import styles from './news.module.css';

export const News = ({ news }: { news: INews }) => (

  <article className={styles.newsItem}>

    <div className={styles.newsItem__header}>

      <div className={styles.newsItem__icon}><NewsIcon type={news.type} /></div>
      {news.type === 'medium' && <a className={`${styles.newsItem__arrow} link`} href="/redirect?postId=582833&amp;redirectType=HTMLPROXY" target="_blank" rel="noopener">=&gt;</a>}

      <h1 className={styles.newsItem__title}>
        <a className={styles.newsItem__link} href={`/redirect?postId=${news.postId}`} target="_blank" rel="noopener noreferrer">
          {news.title}
        </a>
      </h1>
    </div>

    {news.tags && <Tags tags={news.tags} />}

    <div className="cbh__time">
      {news.count}
      <Favorite className="cbh__time__image" />
      {/* {news.date} */}
    </div>

    <div className="content-box-thumb">
      <img src={news.image} alt="Cartinca" />
    </div>

  </article>
);
