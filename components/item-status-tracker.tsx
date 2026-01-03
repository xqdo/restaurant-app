/**
 * Item Status Tracker Component
 * Interactive buttons for updating receipt item status
 * Validates linear progression: pending → preparing → ready → done
 */

import { Button } from '@/components/ui/button'
import type { ReceiptItemStatus } from '@/lib/types/receipt.types'
import {
  IconClock,
  IconChefHat,
  IconCheck,
  IconCircleCheck,
} from '@tabler/icons-react'

interface ItemStatusTrackerProps {
  currentStatus: ReceiptItemStatus
  receiptId: number
  itemId: number
  onStatusUpdate: (
    receiptId: number,
    itemId: number,
    newStatus: ReceiptItemStatus
  ) => Promise<void>
  disabled?: boolean
}

const STATUS_CONFIG: Record<
  ReceiptItemStatus,
  {
    label: string
    icon: React.ElementType
    color: string
    bgColor: string
  }
> = {
  pending: {
    label: 'قيد الانتظار',
    icon: IconClock,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
  },
  preparing: {
    label: 'قيد التحضير',
    icon: IconChefHat,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
  },
  ready: {
    label: 'جاهز',
    icon: IconCheck,
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200',
  },
  done: {
    label: 'مكتمل',
    icon: IconCircleCheck,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
  },
}

const STATUS_ORDER: ReceiptItemStatus[] = [
  'pending',
  'preparing',
  'ready',
  'done',
]

export function ItemStatusTracker({
  currentStatus,
  receiptId,
  itemId,
  onStatusUpdate,
  disabled = false,
}: ItemStatusTrackerProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  const handleStatusClick = async (newStatus: ReceiptItemStatus) => {
    if (disabled) return

    const newIndex = STATUS_ORDER.indexOf(newStatus)

    // Only allow moving forward by 1 step
    if (newIndex !== currentIndex + 1) return

    await onStatusUpdate(receiptId, itemId, newStatus)
  }

  return (
    <div className="flex gap-2 flex-wrap" dir="rtl">
      {STATUS_ORDER.map((status, index) => {
        const config = STATUS_CONFIG[status]
        const Icon = config.icon
        const isCurrent = status === currentStatus
        const isPast = index < currentIndex
        const isNext = index === currentIndex + 1
        const isFuture = index > currentIndex + 1

        // Determine button state
        const isDisabled = disabled || isPast || isCurrent || isFuture
        const isClickable = isNext && !disabled

        return (
          <Button
            key={status}
            onClick={() => handleStatusClick(status)}
            disabled={isDisabled}
            variant={isCurrent ? 'default' : 'outline'}
            className={`
              h-12 px-4 flex items-center gap-2 transition-all
              ${isCurrent ? `${config.bgColor} ${config.color} border-2` : ''}
              ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
              ${isClickable ? `${config.bgColor} ${config.color} cursor-pointer` : ''}
              ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium whitespace-nowrap">
              {config.label}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
