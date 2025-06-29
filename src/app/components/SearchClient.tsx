"use client";
import { useEffect, useState } from 'react';
import OptimizedImage from './OptimizedImage';
import Link from 'next/link';
import { NewsArticle } from '../utils/fetchNews';

interface SearchClientProps {
  query: string;
}

export default function SearchClient({ query }: SearchClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Search across all categories
        const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics'];
        let allResults: NewsArticle[] = [];
        
        for (const category of categories) {
          try {
            const res = await fetch(`/api/news?category=${category}`);
            const data = await res.json();
            const categoryResults = searchInArticles(query, data.articles || []);
            allResults = [...allResults, ...categoryResults];
          } catch (error) {
            console.error(`Search failed for ${category}:`, error);
          }
        }

        // Remove duplicates and sort by relevance
        const uniqueResults = removeDuplicates(allResults);
        const sortedResults = sortByRelevance(uniqueResults, query);
        setArticles(sortedResults);
      } catch (error) {
        console.error('Search failed:', error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Helper functions
  function searchInArticles(query: string, articles: NewsArticle[]): NewsArticle[] {
    const searchQuery = query.toLowerCase().trim();
    const keywords = searchQuery.split(' ').filter(word => word.length > 2);
    
    return articles.filter(article => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      const content = (article.content || '').toLowerCase();
      const author = (article.author || '').toLowerCase();
      const source = (article.source?.name || '').toLowerCase();
      
      const text = `${title} ${description} ${content} ${author} ${source}`;
      
      // Exact phrase match
      if (text.includes(searchQuery)) return true;
      
      // All keywords match
      if (keywords.every(keyword => text.includes(keyword))) return true;
      
      // Most keywords match
      const matchingKeywords = keywords.filter(keyword => text.includes(keyword));
      if (matchingKeywords.length >= Math.ceil(keywords.length * 0.7)) return true;
      
      // Title contains any keyword
      if (keywords.some(keyword => title.includes(keyword))) return true;
      
      return false;
    });
  }

  function removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set();
    return articles.filter(article => {
      const duplicate = seen.has(article.url);
      seen.add(article.url);
      return !duplicate;
    });
  }

  function sortByRelevance(articles: NewsArticle[], query: string): NewsArticle[] {
    const searchQuery = query.toLowerCase().trim();
    
    return articles.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      
      // Exact title match gets highest priority
      if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
      if (bTitle === searchQuery && aTitle !== searchQuery) return 1;
      
      // Title starts with query gets high priority
      if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
      if (bTitle.startsWith(searchQuery) && !aTitle.startsWith(searchQuery)) return 1;
      
      // More recent articles get higher priority
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mt-16">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            Search GlobalEye News
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter a search term to find relevant news articles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Search Results Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-lg text-muted-foreground">
          {isLoading ? (
            <span>Searching...</span>
          ) : (
            <span>
              Found {articles.length} articles matching your search
            </span>
          )}
        </p>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Searching for articles...</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="space-y-6">
          {articles.map((article, index) => (
            <article key={index} className="article-card">
              <OptimizedImage 
                src={article.urlToImage || '/placeholder-news.jpg'} 
                alt={article.title}
                width={400}
                height={200}
                className="article-image"
              />
              <div className="article-content">
                <div className="article-category">Search Result</div>
                <h3 className="article-title">
                  <Link href={`/article/${encodeURIComponent(article.url)}`}>
                    {article.title}
                  </Link>
                </h3>
                <p className="article-excerpt">{article.description}</p>
                <div className="article-meta">
                  <span>{article.source.name}</span>
                  <span>{new Date(article.publishedAt).toUTCString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            No results found for &quot;{query}&quot;
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
} 