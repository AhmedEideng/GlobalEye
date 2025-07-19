interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  dataSize?: number;
  timestamp: string;
  category?: string;
  details?: Record<string, unknown>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string): (_dataSize?: number, _category?: string, _details?: Record<string, unknown>) => void {
    const startTime = Date.now();
    
    return (_dataSize?: number, _category?: string, _details?: Record<string, unknown>) => {
      this.recordMetric({
        operation,
        duration: Date.now() - startTime,
        success: true,
        dataSize: _dataSize,
        timestamp: new Date().toISOString(),
        category: _category,
        details: _details
      });
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(operation?: string, timeWindow?: number): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    totalDataSize: number;
  } {
    let filteredMetrics = this.metrics;
    
    // Filter by operation if specified
    if (operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation === operation);
    }
    
    // Filter by time window if specified (in hours)
    if (timeWindow) {
      const cutoffTime = Date.now() - (timeWindow * 60 * 60 * 1000);
      filteredMetrics = filteredMetrics.filter(m => 
        new Date(m.timestamp).getTime() > cutoffTime
      );
    }

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        totalDataSize: 0
      };
    }

    const durations = filteredMetrics.map(m => m.duration);
    const successful = filteredMetrics.filter(m => m.success);
    const dataSizes = filteredMetrics
      .map(m => m.dataSize || 0)
      .reduce((sum, size) => sum + size, 0);

    return {
      count: filteredMetrics.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: successful.length / filteredMetrics.length,
      totalDataSize: dataSizes
    };
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(thresholdMs: number = 5000): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.duration > thresholdMs)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get recent metrics for a specific operation
   */
  getRecentMetrics(operation: string, limit: number = 10): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.operation === operation)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(hoursOld: number = 24): void {
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get category-specific performance
   */
  getCategoryStats(category: string): {
    count: number;
    avgDuration: number;
    successRate: number;
    totalArticles: number;
  } {
    const categoryMetrics = this.metrics.filter(m => m.category === category);
    
    if (categoryMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        successRate: 0,
        totalArticles: 0
      };
    }

    const durations = categoryMetrics.map(m => m.duration);
    const successful = categoryMetrics.filter(m => m.success);
    const totalArticles = categoryMetrics
      .map(m => (m.details as { articlesCount?: number })?.articlesCount || 0)
      .reduce((sum, count) => sum + count, 0);

    return {
      count: categoryMetrics.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      successRate: successful.length / categoryMetrics.length,
      totalArticles
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper function to measure async operations
export async function measureAsyncOperation<T>(
  operation: string,
  asyncFn: () => Promise<T>,
  category?: string
): Promise<T> {
  const stopTimer = performanceMonitor.startTimer(operation);
  
  try {
    const result = await asyncFn();
    stopTimer(undefined, category, { articlesCount: 0 });
    return result;
  } catch (error) {
    performanceMonitor.recordMetric({
      operation,
      duration: 0, // Will be calculated by stopTimer
      success: false,
      timestamp: new Date().toISOString(),
      category,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    throw error;
  }
}

// Helper function to measure sync operations
export function measureSyncOperation<T>(
  operation: string,
  syncFn: () => T,
  category?: string
): T {
  const stopTimer = performanceMonitor.startTimer(operation);
  
  try {
    const result = syncFn();
    stopTimer(undefined, category, { articlesCount: 0 });
    return result;
  } catch (error) {
    performanceMonitor.recordMetric({
      operation,
      duration: 0,
      success: false,
      timestamp: new Date().toISOString(),
      category,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    throw error;
  }
} 