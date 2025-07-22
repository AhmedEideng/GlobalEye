import { fetchNewsFromGEnews } from './gnews';
import { fetchNewsFromNewsAPI } from './newsapi';
import { fetchNewsFromTheguardian } from './theguardian';
import { fetchNewsFromMediastack } from './mediastack';

export const sources = [
  fetchNewsFromGEnews,
  fetchNewsFromNewsAPI,
  fetchNewsFromTheguardian,
  fetchNewsFromMediastack,
];
