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

/**
 * Convert a local date to its start-of-day as a UTC ISO string.
 * E.g., in UTC+3: "2026-02-07" local midnight → "2026-02-06T21:00:00.000Z"
 * @param date - Date object representing the local day
 * @returns ISO string of local midnight in UTC
 */
export function localStartOfDayUTC(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Convert a local date to its end-of-day as a UTC ISO string.
 * E.g., in UTC+3: "2026-02-07" local 23:59:59 → "2026-02-07T20:59:59.999Z"
 * @param date - Date object representing the local day
 * @returns ISO string of local end-of-day in UTC
 */
export function localEndOfDayUTC(date: Date): string {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}
