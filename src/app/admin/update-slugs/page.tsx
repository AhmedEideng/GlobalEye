"use client";

import { useState, useEffect } from 'react';

interface SlugStats {
  totalArticles: number;
  articlesWithSlugs: number;
  articlesWithoutSlugs: number;
  articlesWithPoorSlugs: number;
  percentageWithSlugs: number;
}

interface UpdateResult {
  success: boolean;
  message: string;
  details?: {
    articlesNeedingSlugs: number;
    articlesWithPoorSlugs: number;
    totalUpdated: number;
  };
}

export default function UpdateSlugsPage() {
  const [stats, setStats] = useState<SlugStats | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Check slug status when page loads
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-slugs?action=check');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setResult(`Status check completed. ${data.stats.percentageWithSlugs}% of articles have good slugs.`);
      } else {
        setResult(`Error checking status: ${data.error}`);
      }
    } catch (error) {
      setResult(`Connection error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const updateSlugs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-slugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update' }),
      });
      const data: UpdateResult = await response.json();
      
      if (data.success) {
        setResult(`Success: ${data.message}`);
        if (data.details) {
          setResult(`Success: ${data.message}. Updated ${data.details.totalUpdated} articles (${data.details.articlesNeedingSlugs} needed slugs, ${data.details.articlesWithPoorSlugs} had poor slugs).`);
        }
        // Refresh stats after update
        setTimeout(checkStatus, 1000);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Connection error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">News Links Management</h1>
      
      {/* Status Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
            <div className="text-sm text-blue-800">Total Articles</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.articlesWithSlugs}</div>
            <div className="text-sm text-green-800">Articles with Good Links</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.articlesWithoutSlugs}</div>
            <div className="text-sm text-red-800">Articles without Links</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.percentageWithSlugs}%</div>
            <div className="text-sm text-yellow-800">Percentage with Good Links</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={checkStatus}
          disabled={loading}
          className="btn btn-secondary flex-1"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
        <button
          onClick={updateSlugs}
          disabled={loading}
          className="btn btn-primary flex-1"
        >
          {loading ? 'Updating...' : 'Update All Links'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
          <h3 className="font-semibold mb-2">Operation Result:</h3>
          <p className="text-gray-700">{result}</p>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">About This System</h3>
        <p className="text-blue-700 mb-4">
          This system will generate and improve links (slugs) for all existing articles in the database.
          This ensures that all news articles have proper, SEO-friendly URLs.
        </p>
        <div className="space-y-2 text-sm text-blue-600">
          <p>• <strong>Check Status:</strong> Shows current statistics about article links</p>
          <p>• <strong>Update All Links:</strong> Generates missing links and improves existing ones</p>
          <p>• <strong>Safe Operation:</strong> This process is safe and won't affect existing content</p>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p>After the update, you will be able to open all articles correctly</p>
          <a href="/world" className="text-red-600 hover:underline">Return to World News</a>
        </div>
      </div>
    </div>
  );
} 