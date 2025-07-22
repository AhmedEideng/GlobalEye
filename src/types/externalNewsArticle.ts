export type ExternalNewsArticle = {
  title: string;
  description?: string;
  url: string;
  author?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: {
    name?: string;
  };
};
