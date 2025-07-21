// src/app/utils/types.ts

export type Article = {
  title: string | null;
  description?: string | null;
  content?: string | null;
  url: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  source?: {
    name?: string | null;
  };
  author?: string | null;
};
