/**
 * Log Detail Dialog Component
 * Displays detailed information about a single audit log entry
 */

'use client'

import type { AuditLog } from '@/lib/types/audit.types'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface LogDetailDialogProps {
  log: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Event labels in Arabic
 */
const eventLabels: Record<string, string> = {
  USER_LOGIN: 'تسجيل دخول',
  USER_LOGOUT: 'تسجيل خروج',
  USER_CREATED: 'إنشاء مستخدم',
  USER_UPDATED: 'تحديث مستخدم',
  USER_DELETED: 'حذف مستخدم',
  ORDER_CREATED: 'طلب جديد',
  ORDER_UPDATED: 'تحديث طلب',
  ORDER_COMPLETED: 'إتمام طلب',
  ORDER_DELETED: 'حذف طلب',
  ITEM_CREATED: 'إضافة صنف',
  ITEM_UPDATED: 'تحديث صنف',
  ITEM_DELETED: 'حذف صنف',
  TABLE_STATUS_CHANGED: 'تغيير حالة طاولة',
  DISCOUNT_APPLIED: 'تطبيق خصم',
  DELIVERY_ASSIGNED: 'تعيين سائق',
  DELIVERY_PAYMENT_UPDATED: 'تحديث دفعة',
  REPORT_EXPORTED: 'تصدير تقرير',
  AUDIT_EXPORTED: 'تصدير سجلات',
}

/**
 * Get event category for color coding
 */
function getEventVariant(
  event: string
):
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning' {
  if (event.startsWith('USER_LOGIN') || event.startsWith('USER_LOGOUT')) {
    return 'default'
  }
  if (event.startsWith('USER_')) {
    return 'secondary'
  }
  if (event.startsWith('ORDER_')) {
    return 'success'
  }
  if (event.startsWith('ITEM_')) {
    return 'warning'
  }
  if (event.startsWith('TABLE_')) {
    return 'default'
  }
  if (event.startsWith('DISCOUNT_')) {
    return 'warning'
  }
  if (event.startsWith('DELIVERY_')) {
    return 'secondary'
  }
  if (event.includes('EXPORTED')) {
    return 'outline'
  }
  return 'default'
}

/**
 * Translate event type to Arabic label
 */
function translateEvent(event: string): string {
  return eventLabels[event] || event
}

export function LogDetailDialog({
  log,
  open,
  onOpenChange,
}: LogDetailDialogProps) {
  if (!log) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تفاصيل السجل #{log.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Log ID */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">رقم السجل</Label>
            <p className="font-medium">#{log.id}</p>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">نوع الحدث</Label>
            <div>
              <Badge variant={getEventVariant(log.event)}>
                {translateEvent(log.event)}
              </Badge>
            </div>
          </div>

          {/* User */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">المستخدم</Label>
            <p className="font-medium">{log.username || 'النظام'}</p>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">رقم المستخدم</Label>
            <p className="font-medium">{log.user_id || '-'}</p>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">التاريخ والوقت</Label>
            <p className="font-medium">{formatDateTime(log.occurred_at)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
