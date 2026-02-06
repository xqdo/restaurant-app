/**
 * Delivery Badge Component
 * Badge to show order type: local (dine-in), takeaway, or delivery
 */

import { Badge } from '@/components/ui/badge'

interface DeliveryBadgeProps {
  isDelivery: boolean
  hasTable?: boolean
}

export function DeliveryBadge({ isDelivery, hasTable }: DeliveryBadgeProps) {
  // Determine order type
  if (isDelivery) {
    return (
      <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
        توصيل
      </Badge>
    )
  }

  if (hasTable) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        محلي
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
      سفري
    </Badge>
  )
}
