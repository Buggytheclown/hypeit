export enum PostResources {
  HABR = 'habr',
}

export interface PostData {
  title: string;
  time: string;
  rawTime: string;
  link: string;
  rating: number;
  tags: string[];
  externalID: string;
}
