/**
 * Performance utilities for PDF processing
 */

/**
 * Process items in chunks to prevent UI blocking
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  chunkSize: number = 10,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(
      chunk.map((item, chunkIndex) => processor(item, i + chunkIndex))
    )
    results.push(...chunkResults)
    
    if (onProgress) {
      onProgress(Math.min(i + chunkSize, items.length), items.length)
    }
    
    // Yield to browser to prevent UI blocking
    if (i + chunkSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
  
  return results
}

/**
 * Debounce function to limit rapid calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit call frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Check if device/browser can handle large PDFs
 */
export function canHandleLargePDF(): boolean {
  // Check available memory (if available)
  const memory = (performance as any).memory
  if (memory) {
    const availableMB = (memory.jsHeapSizeLimit - memory.usedJSHeapSize) / 1024 / 1024
    return availableMB > 100 // Need at least 100MB free
  }
  
  // Fallback: assume modern browsers can handle it
  return true
}

/**
 * Estimate processing time based on file size and page count
 */
export function estimateProcessingTime(fileSizeMB: number, pageCount: number): number {
  // Rough estimates: 0.1s per page + 0.5s per MB
  return Math.ceil(pageCount * 0.1 + fileSizeMB * 0.5)
}

