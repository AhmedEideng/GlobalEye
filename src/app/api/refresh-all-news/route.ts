// src/app/api/refresh-all-news/route.ts

import { fetchExternalNews } from "@/app/utils/fetchExternalNews";
import { saveNewsToSupabase } from "@/app/utils/saveNewsToSupabase";
import { getOrAddCategoryId } from "@/app/utils/categoryHelpers";
import { supabase } from "@/utils/supabase/server";

export async function GET() {
  try {
    const { data: categories, error: catError } = await supabase.from("categories").select();

    if (catError) throw catError;

    if (!categories) throw new Error("No categories found");

    for (const category of categories) {
      const externalNews = await fetchExternalNews(category.name);
      for (const news of externalNews) {
        const categoryId = await getOrAddCategoryId(news.category);
        await saveNewsToSupabase({ ...news, category_id: categoryId });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error refreshing all news:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
    });
  }
}
