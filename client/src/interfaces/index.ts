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
  type: string
  title: string
  count: number
  date: Date
  image: string
  favorite: boolean
  tags: ITags[]
}
