/**
 * Kitchen Item Card Component
 * Displays a single item in flat list view
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeliveryBadge } from '@/components/delivery-badge'
import { ItemStatusTracker } from '@/components/item-status-tracker'
import type { KitchenPendingItem } from '@/lib/types/kitchen.types'
import type { ReceiptItemStatus } from '@/lib/types/receipt.types'
import { formatDateTime } from '@/lib/utils/date'
import { IconTable, IconPhone } from '@tabler/icons-react'

interface KitchenItemCardProps {
  item: KitchenPendingItem
  onStatusUpdate: (
    receiptId: number,
    itemId: number,
    newStatus: ReceiptItemStatus
  ) => Promise<void>
  disabled?: boolean
}

export function KitchenItemCard({
  item,
  onStatusUpdate,
  disabled = false,
}: KitchenItemCardProps) {
  return (
    <Card className="p-4 space-y-3" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{item.item_name}</h3>
            <Badge variant="outline" className="text-xs">
              #{item.receipt_number}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DeliveryBadge isDelivery={item.is_delivery} />
            {item.is_delivery ? (
              item.phone_number && (
                <div className="flex items-center gap-1">
                  <IconPhone className="h-4 w-4" />
                  <span>{item.phone_number}</span>
                </div>
              )
            ) : (
              item.table_number && (
                <div className="flex items-center gap-1">
                  <IconTable className="h-4 w-4" />
                  <span>طاولة {item.table_number}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Quantity - Large Display */}
        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
          <span className="text-3xl font-bold text-primary">
            {item.quantity}
          </span>
          <span className="text-xs text-muted-foreground">الكمية</span>
        </div>
      </div>

      {/* Notes - Highlighted */}
      {item.notes && (
        <div className="bg-orange-50 border-r-4 border-orange-400 p-3 rounded">
          <p className="text-sm font-medium text-orange-900">
            ملاحظات: {item.notes}
          </p>
        </div>
      )}

      {/* Time */}
      <div className="text-xs text-muted-foreground">
        {formatDateTime(item.created_at)}
      </div>

      {/* Status Tracker */}
      <div className="pt-2 border-t">
        <ItemStatusTracker
          currentStatus={item.status}
          receiptId={item.receipt_id}
          itemId={item.id}
          onStatusUpdate={onStatusUpdate}
          disabled={disabled}
        />
      </div>
    </Card>
  )
}
