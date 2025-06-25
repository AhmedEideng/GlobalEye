import { fetchNews, NewsArticle } from "../utils/fetchNews";
import Link from "next/link";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  
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

  // Search across all categories
  const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics'];
  let allResults: NewsArticle[] = [];
  
  for (const category of categories) {
    try {
      const articles = await fetchNews(category);
      const categoryResults = searchInArticles(query, articles);
      allResults = [...allResults, ...categoryResults];
    } catch (error) {
      console.error(`Search failed for ${category}:`, error);
    }
  }

  // Remove duplicates and sort by relevance
  const uniqueResults = removeDuplicates(allResults);
  const sortedResults = sortByRelevance(uniqueResults, query);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link 
          href="/" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Search Results Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Search Results
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Found {sortedResults.length} results for "{query}"
        </p>
      </div>

      {/* Results */}
      {sortedResults.length > 0 ? (
        <div className="space-y-6">
          {sortedResults.map((article, index) => (
            <Link 
              key={`${article.url}-${index}`} 
              href={`/article/${encodeURIComponent(article.url)}`}
              className="card flex gap-6 p-6 bg-card text-card-foreground rounded-lg shadow-sm border border-border hover:shadow-lg"
            >
              {article.urlToImage && (
                <div className="flex-shrink-0">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-48 h-28 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold mb-2 text-foreground leading-tight line-clamp-2">
                  {highlightQuery(article.title, query)}
                </h2>
                <p className="text-base text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                  {highlightQuery(article.description || "", query)}
                </p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{article.source.name}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            No results found
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            We couldn't find any articles matching "{query}"
          </p>
          <p className="text-sm text-muted-foreground">
            Try different keywords or browse our categories
          </p>
        </div>
      )}
    </div>
  );
}

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

function highlightQuery(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
} 