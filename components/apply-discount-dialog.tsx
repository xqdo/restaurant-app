/**
 * Apply Discount Dialog Component
 * Dialog to apply discount to a receipt by entering discount code
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { DISCOUNT_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  ApplyDiscountDto,
  ApplyDiscountResponse,
} from '@/lib/types/discount.types'
import { formatCurrency } from '@/lib/utils/currency'

interface ApplyDiscountDialogProps {
  receiptId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ApplyDiscountDialog({
  receiptId,
  open,
  onOpenChange,
  onSuccess,
}: ApplyDiscountDialogProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error('الرجاء إدخال كود الخصم')
      return
    }

    setLoading(true)

    try {
      const body: ApplyDiscountDto = {
        code: code.trim().toUpperCase(),
        receipt_id: receiptId,
      }

      const result = await apiClient.post<ApplyDiscountResponse>(
        DISCOUNT_ENDPOINTS.apply,
        body
      )

      // Show success message with discount details
      const savedAmount = formatCurrency(
        result.discount_applied.discount_amount.toString()
      )
      toast.success(`تم تطبيق الخصم بنجاح! تم توفير ${savedAmount}`)

      // Reset form and close dialog
      setCode('')
      onOpenChange(false)

      // Notify parent to refresh
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تطبيق الخصم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تطبيق خصم</DialogTitle>
          <DialogDescription>
            أدخل كود الخصم لتطبيقه على هذا الطلب
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount-code">كود الخصم</Label>
              <Input
                id="discount-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال: SUMMER20"
                className="font-mono uppercase"
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري التطبيق...' : 'تطبيق الخصم'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
