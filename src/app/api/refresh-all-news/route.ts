import { NextResponse } from "next/server";
import { fetchExternalNews } from "../../../utils/fetchExternalNews";
import { saveNewsToSupabase } from "../../../utils/saveNewsToSupabase";
import { getAllCategories, getOrAddCategoryId } from "../../../utils/categoryService";
import { rateLimit } from "../../../utils/rateLimit";
import { logSnagEvent } from "../../../utils/logSnag";
import { ContentQualityService } from "../../../utils/ContentQualityService";
import { convertToNewsArticle } from "../../../utils/convertToNewsArticle";

export const dynamic = "force-dynamic";

export async function GET() {
  const { success } = await rateLimit("refresh-all-news", 10);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const categories = await getAllCategories();

  for (const category of categories) {
    const externalNews = await fetchExternalNews(category.name);
    const articles = externalNews.map((item) =>
      convertToNewsArticle(item, category.name)
    );

    const qualityArticles = await ContentQualityService.filter(articles);
    const categoryId = await getOrAddCategoryId(category.name);

    await saveNewsToSupabase(qualityArticles, categoryId);
    await logSnagEvent("News Updated", { category: category.name });
  }

  return NextResponse.json({ message: "News updated successfully" });
}
