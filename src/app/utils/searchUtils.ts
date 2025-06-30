// دوال البحث المشتركة بين SearchBar و SearchClient
import { NewsArticle } from './fetchNews';

export function searchInArticles(query: string, articles: NewsArticle[]): NewsArticle[] {
  const searchQuery = query.toLowerCase().trim();
  const keywords = searchQuery.split(' ').filter(word => word.length > 2);

  return articles.filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = (article.content || '').toLowerCase();
    const author = (article.author || '').toLowerCase();
    const source = (article.source?.name || '').toLowerCase();
    const text = `${title} ${description} ${content} ${author} ${source}`;
    if (text.includes(searchQuery)) return true;
    if (keywords.every(keyword => text.includes(keyword))) return true;
    const matchingKeywords = keywords.filter(keyword => text.includes(keyword));
    if (matchingKeywords.length >= Math.ceil(keywords.length * 0.7)) return true;
    if (keywords.some(keyword => title.includes(keyword))) return true;
    return false;
  });
}

export function removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set();
  return articles.filter(article => {
    const duplicate = seen.has(article.url);
    seen.add(article.url);
    return !duplicate;
  });
}

export function sortByRelevance(articles: NewsArticle[], query: string): NewsArticle[] {
  const searchQuery = query.toLowerCase().trim();
  return articles.sort((a, b) => {
    const aTitle = (a.title || '').toLowerCase();
    const bTitle = (b.title || '').toLowerCase();
    if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
    if (bTitle === searchQuery && aTitle !== searchQuery) return 1;
    if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
    if (bTitle.startsWith(searchQuery) && !aTitle.startsWith(searchQuery)) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
} 