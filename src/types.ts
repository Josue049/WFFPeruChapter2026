export interface Article {
  id: number;
  authorName: string;
  authorLastname: string;
  authorPhoto: string;
  authorCargo: string;
  title: string;
  subtitle: string;
  date: string;
  body: string;
}

export type TabType = 'editor' | 'preview';
