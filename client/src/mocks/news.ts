import { INews } from '../interfaces/index';

export const news: INews[] = [{
  postId: 582833,
  type: 'MEDIUM',
  title: ' Why we switched from Flask to FastAPI for production machine learning',
  count: 281,
  date: new Date(),
  image: 'https://miro.medium.com/max/334/1*zTDCRlfMj5hz986Es3eh9Q.png',
  favorite: true,
  bookMarked: false,
  tags: [
    {
      id: 1,
      name: 'python',
      link: 'python',
    },
    {
      id: 2,
      name: 'programming',
      link: 'programming',
    },
    {
      id: 3,
      name: 'artificial intelligence',
      link: 'artificial intelligence',
    },
    {
      id: 4,
      name: 'machine learning',
      link: 'machine learning',
    },
    {
      id: 5,
      name: 'data science',
      link: 'data science',
    },
  ],
},
{
  postId: 582233,
  type: 'HABR',
  title: ' Why we switched from Flask to FastAPI for production machine learning',
  count: 281,
  date: new Date(),
  image: 'https://miro.medium.com/max/334/1*zTDCRlfMj5hz986Es3eh9Q.png',
  favorite: false,
  bookMarked: true,
  tags: [
    {
      id: 1,
      name: 'python',
      link: 'python',
    },
    {
      id: 2,
      name: 'programming',
      link: 'programming',
    },
    {
      id: 3,
      name: 'artificial intelligence',
      link: 'artificial intelligence',
    },
    {
      id: 4,
      name: 'machine learning',
      link: 'machine learning',
    },
    {
      id: 5,
      name: 'data science',
      link: 'data science',
    },
  ],
}];
