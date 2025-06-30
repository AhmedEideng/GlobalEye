"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OptimizedImage from './OptimizedImage';
import { searchInArticles } from '../utils/searchUtils';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const cacheRef = useRef<{ [q: string]: NewsArticle[] }>({});

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Search function with intelligent matching (on demand)
  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    setShowResults(true);
    if (cacheRef.current[trimmedQuery]) {
      setResults(cacheRef.current[trimmedQuery]);
      setIsLoading(false);
      return;
    }
    try {
      const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics'];
      let searchResults: NewsArticle[] = [];
      for (const category of categories) {
        try {
          const res = await fetch(`/api/news?category=${category}`);
          const articles = await res.json();
          const categoryResults = searchInArticles(trimmedQuery, articles);
          searchResults = [...searchResults, ...categoryResults];
          if (searchResults.length >= 8) break;
        } catch (error) {
          console.error(`Search failed for ${category}:`, error);
        }
      }
      const finalResults = searchResults.slice(0, 8);
      cacheRef.current[trimmedQuery] = finalResults;
      setResults(finalResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search for news..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-border/50">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm font-medium">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((article, index) => (
                <Link
                  key={`${article.url}-${index}`}
                  href={`/article/${encodeURIComponent(article.url)}`}
                  onClick={() => setShowResults(false)}
                  className="block px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 group"
                >
                  <div className="flex gap-4 items-center">
                    {article.urlToImage && (
                      <div className="flex-shrink-0">
                        <OptimizedImage
                          src={article.urlToImage}
                          alt={article.title}
                          width={48}
                          height={40}
                          className="w-12 h-10 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {article.source?.name} • {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setShowResults(false)}
                className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-2 px-4 py-2"
              >
                View all results for &quot;{query}&quot;
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium mb-1">No results found for &quot;{query}&quot;</p>
              <p className="text-xs">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
} 