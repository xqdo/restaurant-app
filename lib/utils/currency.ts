/**
 * Currency Formatting Utilities
 */

/**
 * Format decimal string to currency display
 * @param value - Decimal string or number from API
 * @returns Formatted string like "25.50 د.ع"
 */
export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return '0.00 د.ع'
  }

  return `${num.toFixed(2)} د.ع`
}

/**
 * Format decimal for input field
 * @param value - String input from user
 * @returns Cleaned decimal string
 */
export function formatDecimalInput(value: string): string {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '')

  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }

  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2)
  }

  return cleaned
}

/**
 * Parse user input to decimal string for API
 * @param value - String input from user
 * @returns Decimal string formatted for backend
 */
export function parseDecimalInput(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return '0.00'
  }
  return num.toFixed(2)
}
