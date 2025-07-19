import { NewsArticle } from '@utils/fetchNews';
import SafeText from './SafeText';

/**
 * ⚠️ Security: Do not render any raw HTML from articles here, only plain text.
 * If you need to render HTML, use a sanitization library like sanitize-html or DOMPurify first.
 */

/**
 * ArticleContent component displays the description and main content of an article.
 * @param article - NewsArticle object containing article data
 */
export default function ArticleContent({ article }: { article: NewsArticle }) {
  return (
    <>
      {/* Description */}
      {article.description && (
        <p className="text-base sm:text-lg text-gray-700 mb-6 font-medium break-words text-balance w-full">
          <SafeText>{article.description}</SafeText>
        </p>
      )}
      {/* Content */}
      {article.content && (
        <div className="prose prose-lg max-w-none w-full mb-8 text-gray-900 dark:text-gray-100 break-words text-balance">
          <SafeText>{article.content}</SafeText>
        </div>
      )}
    </>
  );
} 