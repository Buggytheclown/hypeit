import { NewsType } from '../types';

export interface IEvent {
  id: number
  title: string
  link: string
  date: Date
}

export interface ITags {
  id: number
  name: string
  link: string
}

export interface INews {
  postId: number
  type: NewsType
  title: string
  count: number
  date: Date
  image: string
  favorite: boolean
  tags: ITags[]
  bookMarked: boolean
}
