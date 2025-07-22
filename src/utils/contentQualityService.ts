import { Article } from "@/types/article";
import { removeStopWords } from "./removeStopWords";

export type ContentQualityScore = {
  score: number;
  reasons: string[];
};

export class ContentQualityService {
  public static evaluate(article: Article): ContentQualityScore {
    let score = 0;
    const reasons: string[] = [];

    // Title quality (0-0.2 points)
    const titleScore = this.evaluateTitle(article.title);
    score += titleScore.score;
    reasons.push(...titleScore.reasons);

    // Description quality (0-0.2 points)
    const descriptionScore = this.evaluateDescription(article.description ?? null);
    score += descriptionScore.score;
    reasons.push(...descriptionScore.reasons);

    // Tags quality (0-0.2 points)
    const tagsScore = this.evaluateTags(article.tags);
    score += tagsScore.score;
    reasons.push(...tagsScore.reasons);

    // Media quality (0-0.2 points)
    const mediaScore = this.evaluateMedia(article.media);
    score += mediaScore.score;
    reasons.push(...mediaScore.reasons);

    // Originality (0-0.2 points)
    const originalityScore = this.evaluateOriginality(article);
    score += originalityScore.score;
    reasons.push(...originalityScore.reasons);

    return { score, reasons };
  }

  private static evaluateTitle(title: string): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (title.length >= 30 && title.length <= 100) {
      score += 0.1;
    } else {
      reasons.push("العنوان قصير جدًا أو طويل جدًا");
    }

    const words = removeStopWords(title);
    if (words.length >= 5) {
      score += 0.1;
    } else {
      reasons.push("العنوان يفتقر إلى كلمات دالة كافية");
    }

    return { score, reasons };
  }

  private static evaluateDescription(description: string | null): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (!description) {
      reasons.push("الوصف غير موجود");
      return { score, reasons };
    }

    if (description.length >= 100) {
      score += 0.1;
    } else {
      reasons.push("الوصف قصير جدًا");
    }

    const words = removeStopWords(description);
    if (words.length >= 20) {
      score += 0.1;
    } else {
      reasons.push("الوصف يفتقر إلى تفاصيل كافية");
    }

    return { score, reasons };
  }

  private static evaluateTags(tags: string[]): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (tags.length >= 3) {
      score += 0.1;
    } else {
      reasons.push("عدد الوسوم قليل");
    }

    const uniqueTags = new Set(tags);
    if (uniqueTags.size === tags.length) {
      score += 0.1;
    } else {
      reasons.push("الوسوم تحتوي على تكرار");
    }

    return { score, reasons };
  }

  private static evaluateMedia(media: string[]): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (media.length > 0) {
      score += 0.1;
    } else {
      reasons.push("لا توجد وسائط مرفقة");
    }

    const imageTypes = media.filter((url) => url.match(/\.(jpeg|jpg|png|gif)$/));
    const videoTypes = media.filter((url) => url.match(/\.(mp4|mov|avi)$/));

    if (imageTypes.length > 0 || videoTypes.length > 0) {
      score += 0.1;
    } else {
      reasons.push("نوع الوسائط غير مدعوم أو غير موجود");
    }

    return { score, reasons };
  }

  private static evaluateOriginality(article: Article): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (article.isOriginal) {
      score += 0.2;
    } else {
      reasons.push("المحتوى غير أصلي");
    }

    return { score, reasons };
  }
}
