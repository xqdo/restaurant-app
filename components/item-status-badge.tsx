/**
 * Item Status Badge Component
 * Visual badge for displaying receipt item status
 */

import type { ReceiptItemStatus } from '@/lib/types/receipt.types'
import { Badge } from '@/components/ui/badge'

interface ItemStatusBadgeProps {
  status: ReceiptItemStatus
}

const STATUS_CONFIG: Record<
  ReceiptItemStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: {
    label: 'قيد الانتظار',
    variant: 'secondary',
  },
  preparing: {
    label: 'قيد التحضير',
    variant: 'default',
  },
  ready: {
    label: 'جاهز',
    variant: 'outline',
  },
  done: {
    label: 'مكتمل',
    variant: 'outline',
  },
}

export function ItemStatusBadge({ status }: ItemStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  )
}
