import { getArticleByUrl, fetchRelatedNews, detectCategory } from "../../utils/fetchNews";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsReactions } from "../../components/NewsReactions";
import ShareButtons from "../../components/ShareButtons";
import OptimizedImage from '../../components/OptimizedImage';
import ArticleImage from './ArticleImage';

interface ArticlePageProps {
  params: Promise<{
    url: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { url } = await params;
  const article = await getArticleByUrl(url);
  
  if (!article) {
    notFound();
  }

  // Detect category based on article content
  const category = detectCategory(article);
  const relatedArticles = await fetchRelatedNews(article, category);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Main Article */}
      <article className="mb-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-foreground">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span>By {article.author || 'Unknown Author'}</span>
            <span>•</span>
            <span>{article.source.name}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </header>

        {/* Featured Image */}
        {article.urlToImage && (
          <div className="mb-8">
            <ArticleImage 
              src={article.urlToImage} 
              alt={article.title}
              width={800}
              height={400}
              className="w-full max-h-96 object-cover rounded-lg"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="text-lg leading-relaxed text-foreground mb-8">
          {article.description && (
            <p className="text-xl font-medium text-muted-foreground mb-6">
              {article.description}
            </p>
          )}
          
          {article.content && (
            <div className="whitespace-pre-wrap">
              {article.content}
            </div>
          )}
          {/* Share Buttons */}
          <ShareButtons title={article.title} url={`/article/${encodeURIComponent(article.url)}`} />
          {/* User Reactions */}
          <NewsReactions articleUrl={article.url} />
        </div>

        {/* Read Full Article Button */}
        <div className="mb-8 flex justify-center">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-full font-bold shadow-lg hover:from-gray-900 hover:to-black transition-all duration-200 text-lg group"
          >
            <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            اقرأ المقال كاملا
          </a>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            Related Articles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map(relatedArticle => (
              <Link 
                key={relatedArticle.url} 
                href={`/article/${encodeURIComponent(relatedArticle.url)}`}
                className="card bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-lg no-underline"
              >
                {relatedArticle.urlToImage && (
                  <div className="relative h-40 overflow-hidden">
                    <ArticleImage 
                      src={relatedArticle.urlToImage} 
                      alt={relatedArticle.title}
                      width={400}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-base font-semibold mb-2 line-clamp-2 leading-tight text-black dark:text-white">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-sm mb-3 line-clamp-2 leading-relaxed text-black dark:text-white">
                    {relatedArticle.description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-black dark:text-white">{relatedArticle.source.name}</span>
                    <span className="text-black dark:text-white">{new Date(relatedArticle.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 