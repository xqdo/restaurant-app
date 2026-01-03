/**
 * Kitchen Receipt Card Component
 * Displays all items in a receipt grouped together
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DeliveryBadge } from '@/components/delivery-badge'
import { ItemStatusTracker } from '@/components/item-status-tracker'
import type { KitchenReceiptGroup } from '@/lib/types/kitchen.types'
import type { ReceiptItemStatus } from '@/lib/types/receipt.types'
import { formatDateTime } from '@/lib/utils/date'
import { IconTable, IconPhone, IconCircleCheck } from '@tabler/icons-react'

interface KitchenReceiptCardProps {
  receipt: KitchenReceiptGroup
  onStatusUpdate: (
    receiptId: number,
    itemId: number,
    newStatus: ReceiptItemStatus
  ) => Promise<void>
  onCompleteReceipt: (receiptId: number) => Promise<void>
  disabled?: boolean
}

export function KitchenReceiptCard({
  receipt,
  onStatusUpdate,
  onCompleteReceipt,
  disabled = false,
}: KitchenReceiptCardProps) {
  // Check if all items are done
  const allItemsDone = receipt.items.every((item) => item.status === 'done')

  return (
    <Card className="p-4 space-y-4" dir="rtl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-base px-3 py-1">
              #{receipt.receipt_number}
            </Badge>
            <DeliveryBadge isDelivery={receipt.is_delivery} />
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(receipt.created_at)}
          </span>
        </div>

        {/* Table or Phone */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {receipt.is_delivery ? (
            <>
              {receipt.phone_number && (
                <div className="flex items-center gap-1">
                  <IconPhone className="h-4 w-4" />
                  <span>{receipt.phone_number}</span>
                </div>
              )}
              {receipt.location && (
                <span className="text-xs">• {receipt.location}</span>
              )}
            </>
          ) : (
            receipt.table_number && (
              <div className="flex items-center gap-1 font-medium">
                <IconTable className="h-4 w-4" />
                <span>طاولة {receipt.table_number}</span>
              </div>
            )
          )}
        </div>
      </div>

      <Separator />

      {/* Items List */}
      <div className="space-y-4">
        {receipt.items.map((item, index) => (
          <div key={item.id} className="space-y-3">
            {/* Item Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-lg">{item.item_name}</h4>
                {item.notes && (
                  <div className="mt-2 bg-orange-50 border-r-4 border-orange-400 p-2 rounded">
                    <p className="text-sm font-medium text-orange-900">
                      ملاحظات: {item.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px] mr-3">
                <span className="text-2xl font-bold text-primary">
                  {item.quantity}
                </span>
                <span className="text-xs text-muted-foreground">الكمية</span>
              </div>
            </div>

            {/* Status Tracker */}
            <ItemStatusTracker
              currentStatus={item.status}
              receiptId={receipt.receipt_id}
              itemId={item.id}
              onStatusUpdate={onStatusUpdate}
              disabled={disabled}
            />

            {/* Separator between items (not after last item) */}
            {index < receipt.items.length - 1 && (
              <Separator className="my-3" />
            )}
          </div>
        ))}
      </div>

      {/* Complete Receipt Button */}
      {allItemsDone && (
        <>
          <Separator />
          <Button
            onClick={() => onCompleteReceipt(receipt.receipt_id)}
            disabled={disabled}
            className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
          >
            <IconCircleCheck className="h-5 w-5 ml-2" />
            إتمام الطلب
          </Button>
        </>
      )}
    </Card>
  )
}
