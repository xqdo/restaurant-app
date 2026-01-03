/**
 * Order Item Row Component
 * Displays a single item in the order form with quantity controls
 */

'use client'

import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils/currency'

interface OrderItemRowProps {
  item: {
    id: number
    name: string
    price: string
  }
  quantity: number
  notes: string
  onQuantityChange: (newQty: number) => void
  onNotesChange: (notes: string) => void
  onRemove: () => void
}

export function OrderItemRow({
  item,
  quantity,
  notes,
  onQuantityChange,
  onNotesChange,
  onRemove,
}: OrderItemRowProps) {
  const subtotal = parseFloat(item.price) * quantity

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    onQuantityChange(quantity + 1)
  }

  return (
    <div className="border rounded-lg p-3 space-y-2">
      {/* Item Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.name}</h4>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.price)} × {quantity} = {formatCurrency(subtotal)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">الكمية:</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrease}
            disabled={quantity <= 1}
          >
            <IconMinus className="h-3 w-3" />
          </Button>
          <div className="w-12 text-center font-medium">{quantity}</div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrease}
          >
            <IconPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Notes Input */}
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">ملاحظات (اختياري):</label>
        <Input
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="مثال: بدون بصل"
          maxLength={500}
        />
      </div>
    </div>
  )
}
