"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchNews, NewsArticle } from "../utils/fetchNews";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load all articles for search
  useEffect(() => {
    const loadArticles = async () => {
      const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics'];
      let allArticles: NewsArticle[] = [];
      
      for (const category of categories) {
        try {
          const articles = await fetchNews(category);
          allArticles = [...allArticles, ...articles];
        } catch (error) {
          console.error(`Failed to load ${category} articles:`, error);
        }
      }
      
      setAllArticles(allArticles);
    };
    
    loadArticles();
  }, []);

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

  // Search function with intelligent matching
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      // First, search in loaded articles
      const localResults = searchInArticles(searchQuery, allArticles);
      
      if (localResults.length > 0) {
        setResults(localResults.slice(0, 8));
        setIsLoading(false);
        return;
      }

      // If no local results, try to fetch from APIs
      const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics'];
      let searchResults: NewsArticle[] = [];

      for (const category of categories) {
        try {
          const articles = await fetchNews(category);
          const categoryResults = searchInArticles(searchQuery, articles);
          searchResults = [...searchResults, ...categoryResults];
          
          if (searchResults.length >= 8) break;
        } catch (error) {
          console.error(`Search failed for ${category}:`, error);
        }
      }

      setResults(searchResults.slice(0, 8));
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Intelligent search algorithm
  const searchInArticles = (searchQuery: string, articles: NewsArticle[]): NewsArticle[] => {
    const query = searchQuery.toLowerCase().trim();
    const keywords = query.split(' ').filter(word => word.length > 2);
    
    return articles
      .filter(article => {
        const title = (article.title || '').toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = (article.content || '').toLowerCase();
        const author = (article.author || '').toLowerCase();
        const source = (article.source?.name || '').toLowerCase();
        
        const text = `${title} ${description} ${content} ${author} ${source}`;
        
        // Exact phrase match (highest priority)
        if (text.includes(query)) {
          return true;
        }
        
        // All keywords match (high priority)
        if (keywords.every(keyword => text.includes(keyword))) {
          return true;
        }
        
        // Most keywords match (medium priority)
        const matchingKeywords = keywords.filter(keyword => text.includes(keyword));
        if (matchingKeywords.length >= Math.ceil(keywords.length * 0.7)) {
          return true;
        }
        
        // Title contains any keyword (lower priority)
        if (keywords.some(keyword => title.includes(keyword))) {
          return true;
        }
        
        return false;
      })
      .sort((a, b) => {
        // Sort by relevance
        const aTitle = (a.title || '').toLowerCase();
        const bTitle = (b.title || '').toLowerCase();
        
        // Exact title match gets highest priority
        if (aTitle === query && bTitle !== query) return -1;
        if (bTitle === query && aTitle !== query) return 1;
        
        // Title starts with query gets high priority
        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
        if (bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;
        
        // More recent articles get higher priority
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  };

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
  }, [query]);

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search for news, topics, or keywords..."
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
              <p className="text-sm font-medium">جاري البحث...</p>
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
                        <img
                          src={article.urlToImage}
                          alt={article.title}
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
                عرض كل النتائج عن "{query}"
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
              <p className="text-sm font-medium mb-1">لا توجد نتائج عن "{query}"</p>
              <p className="text-xs">جرّب كلمات أخرى أو تحقق من الإملاء</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
} 