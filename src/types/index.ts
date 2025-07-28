export interface NewsItem {
  title: string | null;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  source_name: string;
  author: string | null;
  category?: string;
}
