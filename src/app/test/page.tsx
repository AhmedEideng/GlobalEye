"use client";

import { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface DatabaseDiagnostics {
  summary: {
    status: string;
    hasNews: boolean;
    hasCategories: boolean;
    hasRelationships: boolean;
    totalIssues: number;
  };
  tables: {
    categories: any;
    news: any;
  };
  categoryRelationships?: any;
  issues: string[];
  recommendations: string[];
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dbDiagnostics, setDbDiagnostics] = useState<DatabaseDiagnostics | null>(null);

  useEffect(() => {
    const runTests = async () => {
      const testResults: TestResult[] = [];
      let currentProgress = 0;

      // Test 1: Environment Variables
      try {
        const response = await fetch('/api/test-env');
        const envData = await response.json();
        
        if (response.ok) {
          const envVars = envData.environment;
          const hasRequiredVars = envVars.SUPABASE_URL === 'defined' && envVars.SUPABASE_KEY === 'defined';
          
          testResults.push({
            name: "Environment Variables",
            status: hasRequiredVars ? 'pass' : 'fail',
            message: hasRequiredVars ? 'All required environment variables are configured' : 'Missing required environment variables (SUPABASE_URL and SUPABASE_KEY)',
            details: envVars
          });
        } else {
          testResults.push({
            name: "Environment Variables",
            status: 'fail',
            message: 'Failed to check environment variables',
            details: envData
          });
        }
      } catch (error) {
        testResults.push({
          name: "Environment Variables",
          status: 'fail',
          message: 'Failed to check environment variables',
          details: error
        });
      }
      currentProgress += 20; setProgress(currentProgress);

      // Test 2: Database Connection and Diagnostics
      try {
        const response = await fetch('/api/test-db');
        const diagnostics = await response.json();
        
        if (response.ok) {
          setDbDiagnostics(diagnostics);
          
          const hasIssues = diagnostics.summary?.totalIssues > 0;
          const hasNews = diagnostics.summary?.hasNews;
          const hasCategories = diagnostics.summary?.hasCategories;
          
          testResults.push({
            name: "Database Connection",
            status: 'pass',
            message: `Database connected successfully. Found ${diagnostics.tables?.news?.count || 0} articles and ${diagnostics.tables?.categories?.count || 0} categories`,
            details: diagnostics.summary
          });
          
          testResults.push({
            name: "Database Health",
            status: hasIssues ? 'warning' : 'pass',
            message: hasIssues ? `Database has ${diagnostics.summary.totalIssues} issues that need attention` : 'Database is healthy',
            details: {
              issues: diagnostics.issues,
              recommendations: diagnostics.recommendations
            }
          });
        } else {
          testResults.push({
            name: "Database Connection",
            status: 'fail',
            message: 'Failed to connect to database',
            details: diagnostics
          });
        }
      } catch (error) {
        testResults.push({
          name: "Database Connection",
          status: 'fail',
          message: 'Database connection failed',
          details: error
        });
      }
      currentProgress += 20; setProgress(currentProgress);

      // Test 3: Categories Data
      try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        if (response.ok && categories.length > 0) {
          testResults.push({
            name: "Categories Data",
            status: 'pass',
            message: `Found ${categories.length} categories`,
            details: categories.slice(0, 5) // Show first 5 categories
          });
        } else {
          testResults.push({
            name: "Categories Data",
            status: 'warning',
            message: 'No categories found or API error',
            details: categories
          });
        }
      } catch (error) {
        testResults.push({
          name: "Categories Data",
          status: 'fail',
          message: 'Failed to fetch categories',
          details: error
        });
      }
      currentProgress += 20; setProgress(currentProgress);

      // Test 4: News API
      try {
        const response = await fetch('/api/news-rotation?category=world&limit=5');
        const news = await response.json();
        
        if (response.ok) {
          const articleCount = news.articles?.length || 0;
          testResults.push({
            name: "News API",
            status: articleCount > 0 ? 'pass' : 'warning',
            message: articleCount > 0 ? `News API working. Found ${articleCount} articles for 'world' category` : 'News API working but no articles found',
            details: {
              category: 'world',
              articleCount,
              sampleArticles: news.articles?.slice(0, 2) || []
            }
          });
        } else {
          testResults.push({
            name: "News API",
            status: 'fail',
            message: 'News API failed',
            details: news
          });
        }
      } catch (error) {
        testResults.push({
          name: "News API",
          status: 'fail',
          message: 'News API error',
          details: error
        });
      }
      currentProgress += 20; setProgress(currentProgress);

      // Test 5: API Endpoints
      try {
        const endpoints = [
          '/api/news-rotation?category=politics&limit=3',
          '/api/news-rotation?category=technology&limit=3',
          '/api/news-rotation?category=sports&limit=3'
        ];
        
        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              const response = await fetch(endpoint);
              const data = await response.json();
              return {
                endpoint,
                status: response.ok ? 'success' : 'error',
                articleCount: data.articles?.length || 0
              };
            } catch {
              return { endpoint, status: 'error', articleCount: 0 };
            }
          })
        );
        
        const successfulEndpoints = results.filter(r => r.status === 'success').length;
        const totalArticles = results.reduce((sum, r) => sum + r.articleCount, 0);
        
        testResults.push({
          name: "API Endpoints",
          status: successfulEndpoints > 0 ? 'pass' : 'fail',
          message: `${successfulEndpoints}/${endpoints.length} endpoints working. Total articles: ${totalArticles}`,
          details: results
        });
      } catch (error) {
        testResults.push({
          name: "API Endpoints",
          status: 'fail',
          message: 'API endpoints test failed',
          details: error
        });
      }
      currentProgress += 20; setProgress(currentProgress);

      setResults(testResults);
      setLoading(false);
    };

    runTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">System Diagnostics</h1>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-600">Running diagnostics... {Math.round(progress)}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passedTests = results.filter(r => r.status === 'pass').length;
  const failedTests = results.filter(r => r.status === 'fail').length;
  const warningTests = results.filter(r => r.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">System Diagnostics</h1>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-green-700">Passed</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-blue-700">Total Tests</div>
            </div>
          </div>

          {/* Database Diagnostics */}
          {dbDiagnostics && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div>Status: <span className={`font-medium ${dbDiagnostics.summary.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>{dbDiagnostics.summary.status}</span></div>
                    <div>News Articles: {dbDiagnostics.tables.news?.count || 0}</div>
                    <div>Categories: {dbDiagnostics.tables.categories?.count || 0}</div>
                    <div>Issues: {dbDiagnostics.summary.totalIssues}</div>
                  </div>
                </div>
                
                {dbDiagnostics.categoryRelationships && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Category Relationships</h3>
                    <div className="space-y-1 text-sm">
                      <div>Total Articles: {dbDiagnostics.categoryRelationships.totalArticles}</div>
                      <div>With Category: {dbDiagnostics.categoryRelationships.articlesWithValidCategory}</div>
                      <div>Without Category: {dbDiagnostics.categoryRelationships.articlesWithoutCategory}</div>
                      <div>Percentage: {dbDiagnostics.categoryRelationships.percentageWithCategory}%</div>
                    </div>
                  </div>
                )}
              </div>
              
              {dbDiagnostics.issues.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-red-600 mb-2">Issues Found:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {dbDiagnostics.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {dbDiagnostics.recommendations.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-blue-600 mb-2">Recommendations:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    {dbDiagnostics.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                    <h3 className="font-semibold">{result.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2 text-sm">{result.message}</p>
                {result.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/api/fix-categories?token=your_refresh_token" 
              target="_blank"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
            >
              Fix Categories
            </a>
            <a 
              href="/api/refresh-all-news?token=your_refresh_token" 
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
            >
              Refresh News
            </a>
            <a 
              href="/" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 