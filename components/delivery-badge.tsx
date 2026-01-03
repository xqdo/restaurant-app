/**
 * Delivery Badge Component
 * Badge to show if order is delivery or dine-in
 */

import { Badge } from '@/components/ui/badge'

interface DeliveryBadgeProps {
  isDelivery: boolean
}

export function DeliveryBadge({ isDelivery }: DeliveryBadgeProps) {
  return (
    <Badge variant={isDelivery ? 'default' : 'secondary'}>
      {isDelivery ? 'توصيل' : 'محلي'}
    </Badge>
  )
}
