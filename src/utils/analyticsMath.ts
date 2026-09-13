/**
 * Safe Calculation & Formatting Utilities for Sales Analytics
 * Prevents NaN, Infinity, Division-by-Zero, and Floating Point Precision Issues.
 */

/**
 * Computes a safe percentage (numerator / denominator * 100).
 * Returns 0 if denominator is <= 0 or if inputs are invalid/NaN.
 */
export function safePercentage(
  numerator: number | undefined | null,
  denominator: number | undefined | null,
  decimals: number = 1
): number {
  if (
    numerator === undefined ||
    numerator === null ||
    isNaN(numerator) ||
    denominator === undefined ||
    denominator === null ||
    isNaN(denominator) ||
    denominator <= 0
  ) {
    return 0;
  }

  const raw = (numerator / denominator) * 100;
  const factor = Math.pow(10, decimals);
  return Math.min(100, Math.round(raw * factor) / factor);
}

/**
 * Formats a numeric percentage cleanly (e.g. 52.9 -> "52.9%", 50 -> "50%").
 */
export function formatPercentage(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '0%';
  }
  return `${Number(val.toFixed(1))}%`;
}

/**
 * Formats duration in seconds into a human-readable mm:ss string (e.g. 222 -> "3m 42s").
 */
export function formatDurationSeconds(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
    return '0m 00s';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

/**
 * Safely computes drop-off percentage between consecutive funnel stages.
 */
export function safeDropOffPercentage(
  countFrom: number,
  countTo: number
): { dropCount: number; dropRate: number } {
  if (countFrom <= 0) {
    return { dropCount: 0, dropRate: 0 };
  }
  const dropCount = Math.max(0, countFrom - countTo);
  const dropRate = safePercentage(dropCount, countFrom, 1);
  return { dropCount, dropRate };
}
