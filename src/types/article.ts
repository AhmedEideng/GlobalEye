export type Article = {
  title: string;
  description?: string;
  url: string;
  author?: string;
  publishedAt?: string;
  source?: {
    name?: string;
  };
  tags: string[];
  media: string[];
  isOriginal: boolean;
};
