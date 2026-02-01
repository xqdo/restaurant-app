/**
 * Order Status Badge Component
 * Colored badge showing the overall order status
 */

import type { OrderStatus } from '@/lib/types/receipt.types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'قيد الانتظار',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  preparing: {
    label: 'قيد التحضير',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  ready: {
    label: 'جاهز',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  done: {
    label: 'جاهز للتسليم',
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  completed: {
    label: 'مكتمل',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <Badge
      variant="outline"
      className={cn('whitespace-nowrap', config.className)}
    >
      {config.label}
    </Badge>
  )
}
