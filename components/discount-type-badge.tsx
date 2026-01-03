/**
 * Discount Type Badge Component
 * Badge to display discount type with color coding
 */

import { Badge } from '@/components/ui/badge'
import type { DiscountType } from '@/lib/types/discount.types'

interface DiscountTypeBadgeProps {
  type: DiscountType
}

export function DiscountTypeBadge({ type }: DiscountTypeBadgeProps) {
  const config = {
    amount: {
      variant: 'default' as const,
      label: 'قيمة ثابتة',
    },
    percentage: {
      variant: 'secondary' as const,
      label: 'نسبة مئوية',
    },
    combo: {
      variant: 'outline' as const,
      label: 'عرض مجموعة',
    },
  }

  const { variant, label } = config[type]

  return <Badge variant={variant}>{label}</Badge>
}
