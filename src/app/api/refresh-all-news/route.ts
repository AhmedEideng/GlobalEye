import { NextResponse } from "next/server";
import { rateLimit } from "@/app/utils/rateLimit";
import { fetchExternalNews } from "@/app/utils/fetchExternalNews";
import { convertToNewsArticle } from "@/app/utils/convertToNewsArticle";
import { saveNewsToSupabase } from "@/app/utils/saveNewsToSupabase";
import { ContentQualityService } from "@/app/utils/ContentQualityService";
import { getAllCategories, getOrAddCategoryId } from "@/app/utils/categoryService";
import { logSnagEvent } from "@/app/utils/logSnag";

export const dynamic = "force-dynamic";

export async function GET() {
  const { success } = await rateLimit("refresh-news", 1);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const categories = await getAllCategories();

  const results = await Promise.all(
    categories.map(async (category) => {
      try {
        const externalArticles = await fetchExternalNews(category.name);
        const qualityService = new ContentQualityService();
        const filteredArticles = await qualityService.filter(externalArticles);

        // ✅ تم إضافة الفلترة هنا لتفادي المقالات الناقصة
        const articles = filteredArticles
          .filter(article => article.title && article.url)
          .map(article => convertToNewsArticle(article, category));

        const categoryId = await getOrAddCategoryId(category.name);
        const savedArticles = await saveNewsToSupabase(articles, categoryId);

        await logSnagEvent("news_refresh", {
          category: category.name,
          count: savedArticles.length,
        });

        return {
          category: category.name,
          count: savedArticles.length,
        };
      } catch (error) {
        console.error(`Error fetching or saving articles for category ${category.name}:`, error);
        return {
          category: category.name,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return NextResponse.json({ status: "completed", results });
}
