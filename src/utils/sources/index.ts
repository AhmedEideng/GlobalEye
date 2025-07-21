import { getGNews } from './gnews';
import { getNewsAPI } from './newsapi';
import { getGuardianNews } from './theguardian';
import { getMediastackNews } from './mediastack';

export const sources = [
  getGNews,
  getNewsAPI,
  getGuardianNews,
  getMediastackNews,
];
