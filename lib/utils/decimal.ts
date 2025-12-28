import { Prisma } from '@prisma/client'

/**
 * Serialize Prisma Decimal to string for JSON responses
 * Maintains precision without floating-point errors
 */
export function serializeDecimal(
  value: Prisma.Decimal | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null
  }
  return value.toString()
}

/**
 * Parse decimal input from string or number
 * Used when receiving API input
 */
export function parseDecimalInput(value: string | number): Prisma.Decimal {
  return new Prisma.Decimal(value)
}

/**
 * Format decimal for display (with 2 decimal places)
 */
export function formatDecimal(
  value: Prisma.Decimal | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null
  }
  return value.toFixed(2)
}
