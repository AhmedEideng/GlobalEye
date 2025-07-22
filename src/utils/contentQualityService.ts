import { ExternalNewsArticle } from './types';

export interface ContentQualityScore {
  score: number;
  reasons: string[];
}

// Reliable sources with higher quality scores
const RELIABLE_SOURCES = new Set([
  'reuters',
  'associated press',
  'bloomberg',
  'cnn',
  'bbc',
  'the guardian',
  'the new york times',
  'washington post',
  'wall street journal',
  'forbes',
  'techcrunch',
  'ars technica',
  'wired',
  'nature',
  'science',
  'national geographic',
  'time',
  'the economist'
]);

// Spam indicators
const SPAM_INDICATORS = [
  'click here',
  'buy now',
  'limited time',
  'act now',
  'exclusive offer',
  'free trial',
  'subscribe now',
  'download now',
  'get started',
  'learn more'
];

export class ContentQualityService {
  /**
   * Filter articles based on quality score
   */
  static filterLowQualityArticles(articles: ExternalNewsArticle[]): ExternalNewsArticle[] {
    return articles.filter(article => {
      const qualityScore = this.calculateQualityScore(article);
      return qualityScore.score >= 0.6; // Minimum quality threshold
    });
  }

  /**
   * Calculate quality score for an article
   */
  static calculateQualityScore(article: ExternalNewsArticle): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    // Title quality (0-0.3 points)
    const titleScore = this.evaluateTitle(article.title);
    score += titleScore.score;
    reasons.push(...titleScore.reasons);

    // Description quality (0-0.2 points)
    const descriptionScore = this.evaluateDescription(article.description);
    score += descriptionScore.score;
    reasons.push(...descriptionScore.reasons);

    // Source reliability (0-0.3 points)
    const sourceScore = this.evaluateSource(article.source.name);
    score += sourceScore.score;
    reasons.push(...sourceScore.reasons);

    // Content completeness (0-0.2 points)
    const completenessScore = this.evaluateCompleteness(article);
    score += completenessScore.score;
    reasons.push(...completenessScore.reasons);

    return { score, reasons };
  }

  /**
   * Evaluate article title quality
   */
  private static evaluateTitle(title: string): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (!title || title.trim().length === 0) {
      reasons.push('Empty title');
      return { score: 0, reasons };
    }

    const cleanTitle = title.toLowerCase().trim();

    // Check for spam indicators
    const hasSpam = SPAM_INDICATORS.some(indicator => 
      cleanTitle.includes(indicator)
    );
    if (hasSpam) {
      reasons.push('Title contains spam indicators');
      score -= 0.2;
    }

    // Length check
    if (title.length < 10) {
      reasons.push('Title too short');
      score -= 0.1;
    } else if (title.length > 200) {
      reasons.push('Title too long');
      score -= 0.1;
    } else {
      score += 0.1;
      reasons.push('Good title length');
    }

    // Check for excessive punctuation
    const punctuationCount = (title.match(/[!?]/g) || []).length;
    if (punctuationCount > 2) {
      reasons.push('Excessive punctuation in title');
      score -= 0.1;
    }

    // Check for all caps
    if (title === title.toUpperCase() && title.length > 10) {
      reasons.push('Title in all caps');
      score -= 0.1;
    }

    // Bonus for good titles
    if (score >= 0.1 && !hasSpam) {
      score += 0.2;
      reasons.push('High quality title');
    }

    return { score: Math.max(0, Math.min(0.3, score)), reasons };
  }

  /**
   * Evaluate article description quality
   */
  private static evaluateDescription(description: string | null): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (!description || description.trim().length === 0) {
      reasons.push('No description');
      return { score: 0, reasons };
    }

    const cleanDescription = description.toLowerCase().trim();

    // Check for spam indicators
    const hasSpam = SPAM_INDICATORS.some(indicator => 
      cleanDescription.includes(indicator)
    );
    if (hasSpam) {
      reasons.push('Description contains spam indicators');
      score -= 0.1;
    }

    // Length check
    if (description.length < 20) {
      reasons.push('Description too short');
      score -= 0.05;
    } else if (description.length > 500) {
      reasons.push('Description too long');
      score -= 0.05;
    } else {
      score += 0.1;
      reasons.push('Good description length');
    }

    // Check for excessive links
    const linkCount = (description.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 2) {
      reasons.push('Too many links in description');
      score -= 0.05;
    }

    // Bonus for good descriptions
    if (score >= 0.05 && !hasSpam) {
      score += 0.1;
      reasons.push('High quality description');
    }

    return { score: Math.max(0, Math.min(0.2, score)), reasons };
  }

  /**
   * Evaluate source reliability
   */
  private static evaluateSource(sourceName: string): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    if (!sourceName || sourceName.trim().length === 0) {
      reasons.push('Unknown source');
      return { score: 0.1, reasons };
    }

    const cleanSourceName = sourceName.toLowerCase().trim();

    // Check if it's a reliable source
    if (RELIABLE_SOURCES.has(cleanSourceName)) {
      score += 0.3;
      reasons.push('Reliable source');
    } else {
      // Check for common news indicators
      const newsIndicators = ['news', 'times', 'post', 'tribune', 'herald', 'journal'];
      const hasNewsIndicator = newsIndicators.some(indicator => 
        cleanSourceName.includes(indicator)
      );
      
      if (hasNewsIndicator) {
        score += 0.2;
        reasons.push('News source');
      } else {
        score += 0.1;
        reasons.push('Standard source');
      }
    }

    return { score: Math.max(0, Math.min(0.3, score)), reasons };
  }

  /**
   * Evaluate content completeness
   */
  private static evaluateCompleteness(article: ExternalNewsArticle): ContentQualityScore {
    const reasons: string[] = [];
    let score = 0;

    // Check for required fields
    const hasTitle = article.title && article.title.trim().length > 0;
    const hasUrl = article.url && article.url.trim().length > 0;
    const hasPublishedAt = article.publishedAt && article.publishedAt.trim().length > 0;
    const hasSource = article.source?.name && article.source.name.trim().length > 0;

    if (hasTitle) {
      score += 0.05;
      reasons.push('Has title');
    }
    if (hasUrl) {
      score += 0.05;
      reasons.push('Has URL');
    }
    if (hasPublishedAt) {
      score += 0.05;
      reasons.push('Has publication date');
    }
    if (hasSource) {
      score += 0.05;
      reasons.push('Has source');
    }

    // Bonus for additional content
    if (article.description && article.description.trim().length > 0) {
      score += 0.05;
      reasons.push('Has description');
    }
    if (article.urlToImage && article.urlToImage.trim().length > 0) {
      score += 0.05;
      reasons.push('Has image');
    }
    if (article.author && article.author.trim().length > 0) {
      score += 0.05;
      reasons.push('Has author');
    }

    return { score: Math.max(0, Math.min(0.2, score)), reasons };
  }

  /**
   * Get quality statistics for a batch of articles
   */
  static getQualityStats(articles: ExternalNewsArticle[]): {
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
    scoreDistribution: Record<string, number>;
  } {
    const scores = articles.map(article => this.calculateQualityScore(article));
    const passed = scores.filter(score => score.score >= 0.6).length;
    const failed = scores.length - passed;
    const averageScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;

    // Score distribution
    const distribution: Record<string, number> = {
      'excellent (0.8-1.0)': 0,
      'good (0.6-0.8)': 0,
      'fair (0.4-0.6)': 0,
      'poor (0.2-0.4)': 0,
      'very poor (0.0-0.2)': 0
    };

    scores.forEach(score => {
      if (score.score >= 0.8) distribution['excellent (0.8-1.0)']++;
      else if (score.score >= 0.6) distribution['good (0.6-0.8)']++;
      else if (score.score >= 0.4) distribution['fair (0.4-0.6)']++;
      else if (score.score >= 0.2) distribution['poor (0.2-0.4)']++;
      else distribution['very poor (0.0-0.2)']++;
    });

    return {
      total: articles.length,
      passed,
      failed,
      averageScore,
      scoreDistribution: distribution
    };
  }
} 
