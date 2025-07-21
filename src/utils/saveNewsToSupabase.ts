import { supabase } from "@/lib/supabaseClient";
import { Article } from "./types";
import { getOrAddCategoryId } from "./categories";

export async function saveNewsToSupabase(articles: Article[], category: string) {
  if (!articles || articles.length === 0) return;

  const categoryId = await getOrAddCategoryId(category);

  // ✅ فلترة المقالات التي لا تحتوي على title أو url
  const filteredArticles = articles.filter(article => article.title && article.url);

  for (const article of filteredArticles) {
    const { title, description, content, url, urlToImage, publishedAt, source, author } = article;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const { data, error } = await supabase
      .from("news")
      .upsert(
        [{
          title,
          description,
          content,
          url,
          url_to_image: urlToImage,
          published_at: publishedAt,
          source_name: source?.name || null,
          author: author || null,
          slug,
          category_id: categoryId,
        }],
        { onConflict: "url" }
      );

    if (error) {
      console.error(`❌ Error saving article: ${title}`);
      console.error(error);
    } else {
      console.log(`✅ Article saved: ${title}`);
    }
  }
}
