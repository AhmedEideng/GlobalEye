export async function saveNewsToSupabase(articles: ExternalNewsArticle[], category_id: number) {
  try {
    if (!articles.length) return;
    if (!category_id) return;

    const mapped = articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      published_at: article.publishedAt ? new Date(article.publishedAt) : null,
      slug: generateSlug(article.title, article.url),
      content: article.content,
      author: article.author,
      url_to_image: article.urlToImage,
      is_featured: false,
      views_count: 0,
      source_name: article.source.name,
      category_id,
    }));

    console.log('📰 Articles to upsert:', mapped.length);

    const { error } = await supabase
      .from('news')
      .upsert(mapped, { onConflict: 'url' });

    if (error) {
      console.error('❌ Supabase upsert error:', error.message || error);
    } else {
      console.log('✅ Articles upserted successfully.');
    }
  } catch (err) {
    console.error('❌ Exception in saveNewsToSupabase:', err);
  }
}
