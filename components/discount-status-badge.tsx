/**
 * Discount Status Badge Component
 * Badge to display discount status based on multiple conditions
 */

import { Badge } from '@/components/ui/badge'
import type { Discount } from '@/lib/types/discount.types'

interface DiscountStatusBadgeProps {
  discount: Discount
}

export function DiscountStatusBadge({ discount }: DiscountStatusBadgeProps) {
  const now = new Date()
  const startDate = new Date(discount.start_date)
  const endDate = new Date(discount.end_date)
  const isExpired = now > endDate
  const isNotStarted = now < startDate
  const isUsageLimitReached =
    discount.max_receipts !== null &&
    discount.max_receipts !== undefined &&
    discount.usage_count >= discount.max_receipts

  // Determine status
  if (!discount.is_active) {
    return <Badge variant="secondary">غير نشط</Badge>
  }

  if (isNotStarted) {
    return <Badge variant="outline">لم يبدأ</Badge>
  }

  if (isExpired) {
    return <Badge variant="destructive">منتهي</Badge>
  }

  if (isUsageLimitReached) {
    return (
      <Badge variant="outline" className="border-orange-500 text-orange-700">
        حد الاستخدام
      </Badge>
    )
  }

  return <Badge className="bg-green-600">نشط</Badge>
}
