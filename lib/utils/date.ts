/**
 * Date Formatting Utilities
 * Uses date-fns with Arabic locale for RTL support
 */

import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

/**
 * Format ISO date string to Arabic date and time display
 * @param isoDate - ISO date string from API
 * @returns Formatted string like "١٥ يناير ٢٠٢٥, ٣:٣٠ م"
 */
export function formatDateTime(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'PPp', { locale: ar })
  } catch (error) {
    return isoDate
  }
}

/**
 * Format ISO date string to Arabic date only
 * @param isoDate - ISO date string from API
 * @returns Formatted string like "١٥ يناير ٢٠٢٥"
 */
export function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'PP', { locale: ar })
  } catch (error) {
    return isoDate
  }
}

/**
 * Format ISO date string to time only
 * @param isoDate - ISO date string from API
 * @returns Formatted string like "٣:٣٠ م"
 */
export function formatTime(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'p', { locale: ar })
  } catch (error) {
    return isoDate
  }
}

/**
 * Format date to YYYY-MM-DD for API queries
 * @param date - Date object
 * @returns Formatted string like "2025-01-15"
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
