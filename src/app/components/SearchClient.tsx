"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { searchInArticles, removeDuplicates, sortByRelevance } from '../utils/searchUtils';
import { NewsArticle, cleanImageUrl } from '../utils/fetchNews';

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
            <Link key={index} href={`/article/${article.slug}`} className="block article-card transition-transform duration-200 hover:scale-105 focus:outline-none">
              <div className="relative w-full h-48 overflow-hidden">
                <OptimizedImage
                  src={cleanImageUrl(article.urlToImage) || '/placeholder-news.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  sizes="100vw"
                />
              </div>
              <div className="article-content">
                <div className="article-category">Search Result</div>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.description}</p>
                <div className="article-meta">
                  <span>{article.source.name}</span>
                  <span>{new Date(article.publishedAt).toUTCString()}</span>
                </div>
              </div>
            </Link>
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