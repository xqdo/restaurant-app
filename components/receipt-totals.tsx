/**
 * Receipt Totals Component
 * Displays subtotal, discount, and total with proper formatting
 */

import { formatCurrency } from '@/lib/utils/currency'

interface ReceiptTotalsProps {
  subtotal: string
  discount: string
  total: string
}

export function ReceiptTotals({
  subtotal,
  discount,
  total,
}: ReceiptTotalsProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">المجموع الفرعي:</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Discount */}
      {parseFloat(discount) > 0 && (
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="text-muted-foreground">الخصم:</span>
          <span className="text-red-600 font-medium">
            -{formatCurrency(discount)}
          </span>
        </div>
      )}

      {/* Final Total */}
      <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
        <span>الإجمالي النهائي:</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
