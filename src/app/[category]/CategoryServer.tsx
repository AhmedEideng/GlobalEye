import { createClient } from '@supabase/supabase-js';
import { NewsArticle } from '@/utils/fetchNews';
import { getOrAddCategoryId } from '@/utils/categoryUtils';
import Image from 'next/image';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://xernfvwyruihyezuwybi.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw'
);

async function fetchCategoryNews(category: string): Promise<NewsArticle[]> {
  try {
    // Get category ID first
    const categoryId = await getOrAddCategoryId(category);
    
    if (!categoryId) {
      console.error('Category not found:', category);
      return [];
    }

    const { data, error } = await supabase
      .from('news')
      .select('*, categories(name)')
      .eq('category_id', categoryId)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching category news:', error);
      return [];
    }

    // Transform data to match NewsArticle interface
    return (data || []).map((article: any) => ({
      source: { id: null, name: article.source_name || 'Unknown' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      content: article.content,
      slug: article.slug,
      category: article.categories?.name || category,
    }));
  } catch (error) {
    console.error('Error in fetchCategoryNews:', error);
    return [];
  }
}

export default async function CategoryServer({ 
  params 
}: { 
  params: { category: string } 
}) {
  try {
    const articles = await fetchCategoryNews(params.category);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">{params.category}</h1>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {article.image_url && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={article.image_url} 
                      alt={article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-red-600 transition-colors">{article.title}</h2>
                  <p className="text-gray-600 mb-2">{article.description}</p>
                  <div className="text-sm text-gray-500">
                    {new Date(article.published_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found for this category.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in CategoryServer:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Category</h1>
          <p className="text-gray-600">Failed to load articles for {params.category}</p>
        </div>
      </div>
    );
  }
} 