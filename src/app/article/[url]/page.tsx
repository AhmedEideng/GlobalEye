import { getArticleBySlug, fetchRelatedNews, detectCategory } from "../../utils/fetchNews";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "../../components/ShareButtons";
import ArticleImage from './ArticleImage';
import Image from "next/image";
import { Metadata } from 'next';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let article = null;
  try {
    article = await getArticleBySlug(slug);
  } catch {}
  const title = article?.title ? `${article.title} | GlobalEye News` : 'Article | GlobalEye News';
  const description = article?.description || 'Read the full article and related news on GlobalEye News.';
  const pageUrl = `https://globaleye.news/article/${slug}`; // Edit this to your final site URL
  const image = article?.urlToImage || '/placeholder-news.jpg';
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'GlobalEye News',
      images: [
        { url: image, width: 1200, height: 630, alt: article?.title || 'GlobalEye News' }
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@globaleyenews',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }
  // Detect category based on article content
  const category = detectCategory(article);
  const relatedArticles = await fetchRelatedNews(article, category);

  return (
    <div className="w-full px-0 py-8">
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
          <div
            className="mb-8 relative w-full rounded-lg overflow-hidden"
            style={{
              height: "clamp(250px, 40vw, 450px)",
              background: "#eee"
            }}
          >
            <Image
              src={article.urlToImage}
              alt={article.title}
              fill
              style={{
                objectFit: "cover"
              }}
              priority
              sizes="100vw"
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
        </div>
        {/* Read Full Article Button */}
        <div className="mb-8 flex justify-center">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2 bg-primary text-white rounded-md font-semibold shadow-md hover:bg-primary/90 transition-all duration-200 text-base border-0 no-underline"
          >
            Read Full Article
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
                className="card bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-lg no-underline related-articles-link"
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
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 