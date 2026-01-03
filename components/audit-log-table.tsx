/**
 * Audit Log Table Component
 * Displays audit logs in a table format with event badges
 */

'use client'

import { IconEye } from '@tabler/icons-react'
import type { AuditLog } from '@/lib/types/audit.types'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AuditLogTableProps {
  logs: AuditLog[]
  loading: boolean
  onViewDetails: (log: AuditLog) => void
}

/**
 * Event labels in Arabic
 */
const eventLabels: Record<string, string> = {
  // Authentication
  USER_LOGIN: 'تسجيل دخول',
  USER_LOGOUT: 'تسجيل خروج',

  // Users
  USER_CREATED: 'إنشاء مستخدم',
  USER_UPDATED: 'تحديث مستخدم',
  USER_DELETED: 'حذف مستخدم',

  // Orders
  ORDER_CREATED: 'طلب جديد',
  ORDER_UPDATED: 'تحديث طلب',
  ORDER_COMPLETED: 'إتمام طلب',
  ORDER_DELETED: 'حذف طلب',

  // Items
  ITEM_CREATED: 'إضافة صنف',
  ITEM_UPDATED: 'تحديث صنف',
  ITEM_DELETED: 'حذف صنف',

  // Tables
  TABLE_STATUS_CHANGED: 'تغيير حالة طاولة',

  // Discounts
  DISCOUNT_APPLIED: 'تطبيق خصم',

  // Delivery
  DELIVERY_ASSIGNED: 'تعيين سائق',
  DELIVERY_PAYMENT_UPDATED: 'تحديث دفعة',

  // Reports
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
    return 'default' // Blue
  }
  if (event.startsWith('USER_')) {
    return 'secondary' // Purple
  }
  if (event.startsWith('ORDER_')) {
    return 'success' // Green
  }
  if (event.startsWith('ITEM_')) {
    return 'warning' // Orange
  }
  if (event.startsWith('TABLE_')) {
    return 'default' // Cyan
  }
  if (event.startsWith('DISCOUNT_')) {
    return 'warning' // Yellow
  }
  if (event.startsWith('DELIVERY_')) {
    return 'secondary' // Pink
  }
  if (event.includes('EXPORTED')) {
    return 'outline' // Gray
  }
  return 'default'
}

/**
 * Translate event type to Arabic label
 */
function translateEvent(event: string): string {
  return eventLabels[event] || event
}

export function AuditLogTable({
  logs,
  loading,
  onViewDetails,
}: AuditLogTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">لا توجد سجلات نشاط</p>
        <p className="text-sm text-muted-foreground mt-2">
          جرب تغيير الفلاتر لعرض النتائج
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم السجل</TableHead>
            <TableHead className="text-right">التاريخ والوقت</TableHead>
            <TableHead className="text-right">المستخدم</TableHead>
            <TableHead className="text-right">رقم المستخدم</TableHead>
            <TableHead className="text-right">الحدث</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow
              key={log.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => onViewDetails(log)}
            >
              <TableCell className="font-medium">#{log.id}</TableCell>
              <TableCell className="text-sm">
                {formatDateTime(log.occurred_at)}
              </TableCell>
              <TableCell>{log.username || 'النظام'}</TableCell>
              <TableCell>{log.user_id || '-'}</TableCell>
              <TableCell>
                <Badge variant={getEventVariant(log.event)}>
                  {translateEvent(log.event)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails(log)
                  }}
                >
                  <IconEye className="h-4 w-4" />
                  <span className="mr-2 hidden sm:inline">عرض التفاصيل</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
