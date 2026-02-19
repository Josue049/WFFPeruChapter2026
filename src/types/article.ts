export interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  date: string;
  author: {
    name: string;
    role: string;
    photo: string;
  };
  content: string;
}
