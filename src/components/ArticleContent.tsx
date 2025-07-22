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
      {/* Description / Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-red-700" role="img" aria-label="summary">📝</span>
          <span className="text-lg font-bold text-gray-800">Article Summary</span>
        </div>
        {article.description ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm text-base sm:text-lg text-gray-700 font-medium break-words text-balance w-full">
            <SafeText>{article.description}</SafeText>
          </div>
        ) : (
          <div className="bg-gray-100 border-l-4 border-gray-300 p-4 rounded text-gray-500 italic">
            No summary available for this article.
          </div>
        )}
      </div>
      {/* Content */}
      {article.content && (
        <div className="prose prose-lg max-w-none w-full mb-8 text-gray-900 dark:text-gray-100 break-words text-balance">
          <SafeText>{article.content}</SafeText>
        </div>
      )}
    </>
  );
} 