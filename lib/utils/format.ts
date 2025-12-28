/**
 * Format price with currency (Saudi Riyal)
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return '0.00 ر.س'
  }

  return `${numPrice.toFixed(2)} ر.س`
}
