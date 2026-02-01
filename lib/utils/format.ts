/**
 * Format price with currency (Iraqi Dinar)
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return '0.00 د.ع'
  }

  return `${numPrice.toFixed(2)} د.ع`
}
