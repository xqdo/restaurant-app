/**
 * Kitchen Display Component
 * Main logic for handling status updates and rendering items
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { KitchenItemCard } from '@/components/kitchen-item-card'
import { KitchenReceiptCard } from '@/components/kitchen-receipt-card'
import type {
  KitchenPendingItem,
  KitchenReceiptGroup,
  UpdateItemStatusDto,
} from '@/lib/types/kitchen.types'
import type { ReceiptItemStatus } from '@/lib/types/receipt.types'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints'

interface KitchenDisplayProps {
  viewMode: 'list' | 'grouped'
  listData?: KitchenPendingItem[]
  groupedData?: KitchenReceiptGroup[]
  onRefresh: () => void
}

export function KitchenDisplay({
  viewMode,
  listData = [],
  groupedData = [],
  onRefresh,
}: KitchenDisplayProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  const handleStatusUpdate = async (
    receiptId: number,
    itemId: number,
    newStatus: ReceiptItemStatus
  ) => {
    // Prevent duplicate requests
    if (updatingItems.has(itemId)) return

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId))

      const endpoint = ORDER_ENDPOINTS.updateItemStatus(receiptId, itemId)
      const body: UpdateItemStatusDto = { status: newStatus }

      await apiClient.put(endpoint, body)

      toast.success('تم تحديث حالة الصنف بنجاح')
      onRefresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'فشل تحديث حالة الصنف'
      toast.error(message)
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleCompleteReceipt = async (receiptId: number) => {
    try {
      const endpoint = ORDER_ENDPOINTS.receiptComplete(receiptId)
      await apiClient.put(endpoint)

      toast.success('تم إتمام الطلب بنجاح')
      onRefresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'فشل إتمام الطلب'
      toast.error(message)
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listData.map((item) => (
          <KitchenItemCard
            key={item.id}
            item={item}
            onStatusUpdate={handleStatusUpdate}
            disabled={updatingItems.has(item.id)}
          />
        ))}
      </div>
    )
  }

  // Grouped view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groupedData.map((receipt) => (
        <KitchenReceiptCard
          key={receipt.receipt_id}
          receipt={receipt}
          onStatusUpdate={handleStatusUpdate}
          onCompleteReceipt={handleCompleteReceipt}
          disabled={receipt.items.some((item) => updatingItems.has(item.id))}
        />
      ))}
    </div>
  )
}
