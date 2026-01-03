/**
 * Receipt Totals Component
 * Displays subtotal, discounts, and total with proper formatting
 */

import type { AppliedDiscount } from '@/lib/types/receipt.types'
import { formatCurrency } from '@/lib/utils/currency'

interface ReceiptTotalsProps {
  subtotal: string
  discountAmount: string
  total: string
  appliedDiscounts: AppliedDiscount[]
}

export function ReceiptTotals({
  subtotal,
  discountAmount,
  total,
  appliedDiscounts,
}: ReceiptTotalsProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">المجموع الفرعي:</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Applied Discounts */}
      {appliedDiscounts.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">الخصومات المطبقة:</p>
          {appliedDiscounts.map((discount, index) => (
            <div
              key={`${discount.discount_id}-${index}`}
              className="flex items-center justify-between text-sm pr-4"
            >
              <span className="text-muted-foreground">
                {discount.discount_name}{' '}
                <span className="text-xs">
                  ({discount.discount_type === 'PERCENTAGE'
                    ? `${discount.discount_value}%`
                    : formatCurrency(discount.discount_value)})
                </span>
              </span>
              <span className="text-red-600 font-medium">
                -{formatCurrency(discount.amount_saved)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Discount Total */}
      {parseFloat(discountAmount) > 0 && (
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="text-muted-foreground">إجمالي الخصم:</span>
          <span className="text-red-600 font-medium">
            -{formatCurrency(discountAmount)}
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
