"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function FixImagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not admin
  if (!mounted) {
    return null;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleFixImages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fix-images');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to fix images');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fix Missing Images</h1>
          <div className="w-20 h-1 bg-red-600 rounded mb-4"></div>
          <p className="text-gray-600">
            Check and fix articles with missing or invalid image URLs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Image Fix Tool</h2>
          
          <button
            onClick={handleFixImages}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Fixing Images...' : 'Fix Missing Images'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{result.stats?.totalArticles || 0}</div>
                  <div className="text-green-600">Total Articles</div>
                </div>
                
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{result.stats?.hasImages || 0}</div>
                  <div className="text-blue-600">Articles with Images</div>
                </div>
                
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-800">{result.stats?.missingImages || 0}</div>
                  <div className="text-yellow-600">Missing Images</div>
                </div>
                
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{result.stats?.updatedArticles || 0}</div>
                  <div className="text-green-600">Updated Articles</div>
                </div>
              </div>

              {result.updatedArticles && result.updatedArticles.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Updated Articles:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    {result.updatedArticles.map((article: any, index: number) => (
                      <div key={article.id} className="mb-2 p-2 bg-white rounded border">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-gray-600">ID: {article.id}</div>
                        <div className="text-sm text-gray-600">New Image: {article.image_url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <strong>Success:</strong> {result.message}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
          <div className="prose max-w-none">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the &quot;Fix Missing Images&quot; button to scan the database</li>
              <li>The tool will identify articles with missing or invalid image URLs</li>
              <li>Articles with null, empty, or invalid image URLs will be updated with a placeholder image</li>
              <li>You can view the results and see which articles were updated</li>
              <li>After fixing, all articles should display images properly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 