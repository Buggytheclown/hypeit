import React from 'react';
import { INews } from '../../interfaces/index';
import { News } from './News';

export const NewsList = ({ news }: { news: INews[] }) => (
  <>
    { news.map((item) => <News key={item.postId} news={item} />) }
  </>
);
