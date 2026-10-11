export interface Article {
  id: number;
  author_name: string;
  author_lastname: string;
  author_photo: string;
  author_cargo: string;
  title: string;
  subtitle: string;
  date: string;
  body: string;
  tag_id: number | null;
  tag_name: string | null;
  tag_color: string | null;
}
