import { getGNews } from './gnews';
import { getNewsAPI } from './newsapi';
import { getGuardianNews } from './guardian';
import { getMediastackNews } from './mediastack';

export const sources = [
  getGNews,
  getNewsAPI,
  getGuardianNews,
  getMediastackNews,
];
