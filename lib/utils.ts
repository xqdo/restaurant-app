import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Western numerals (0-9) to Arabic-Indic numerals (٠-٩)
 */
export function toArabicNumerals(value: string | number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value).replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
}

/**
 * Format number with Arabic numerals and thousands separator
 */
export function formatArabicNumber(value: number, decimals = 0): string {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return toArabicNumerals(formatted);
}
