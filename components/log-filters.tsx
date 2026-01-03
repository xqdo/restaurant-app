/**
 * Log Filters Component
 * Filter controls for audit logs (user, event type, date range)
 */

'use client'

import { useState } from 'react'
import { IconFilter, IconX } from '@tabler/icons-react'
import type { AuditLogFilters } from '@/lib/types/audit.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LogFiltersProps {
  filters: AuditLogFilters
  onFiltersChange: (filters: AuditLogFilters) => void
}

/**
 * Available event types for filtering
 */
const EVENT_TYPES = [
  { value: 'USER_LOGIN', label: 'تسجيل دخول' },
  { value: 'USER_LOGOUT', label: 'تسجيل خروج' },
  { value: 'USER_CREATED', label: 'إنشاء مستخدم' },
  { value: 'USER_UPDATED', label: 'تحديث مستخدم' },
  { value: 'USER_DELETED', label: 'حذف مستخدم' },
  { value: 'ORDER_CREATED', label: 'طلب جديد' },
  { value: 'ORDER_UPDATED', label: 'تحديث طلب' },
  { value: 'ORDER_COMPLETED', label: 'إتمام طلب' },
  { value: 'ORDER_DELETED', label: 'حذف طلب' },
  { value: 'ITEM_CREATED', label: 'إضافة صنف' },
  { value: 'ITEM_UPDATED', label: 'تحديث صنف' },
  { value: 'ITEM_DELETED', label: 'حذف صنف' },
  { value: 'TABLE_STATUS_CHANGED', label: 'تغيير حالة طاولة' },
  { value: 'DISCOUNT_APPLIED', label: 'تطبيق خصم' },
  { value: 'DELIVERY_ASSIGNED', label: 'تعيين سائق' },
  { value: 'DELIVERY_PAYMENT_UPDATED', label: 'تحديث دفعة' },
  { value: 'REPORT_EXPORTED', label: 'تصدير تقرير' },
  { value: 'AUDIT_EXPORTED', label: 'تصدير سجلات' },
]

export function LogFilters({ filters, onFiltersChange }: LogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters)

  const handleApplyFilters = () => {
    onFiltersChange({
      ...localFilters,
      page: 1, // Reset to page 1 when filters change
    })
  }

  const handleClearFilters = () => {
    const clearedFilters: AuditLogFilters = {
      page: 1,
      limit: filters.limit || 50,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    localFilters.user_id ||
    localFilters.event ||
    localFilters.start_date ||
    localFilters.end_date

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">تصفية سجلات النشاط</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <IconX className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="user-filter">رقم المستخدم</Label>
          <Input
            id="user-filter"
            type="number"
            placeholder="جميع المستخدمين"
            value={localFilters.user_id || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                user_id: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* Event Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="event-filter">نوع الحدث</Label>
          <Select
            value={localFilters.event || 'all'}
            onValueChange={(value) =>
              setLocalFilters({
                ...localFilters,
                event: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="event-filter">
              <SelectValue placeholder="جميع الأحداث" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأحداث</SelectItem>
              {EVENT_TYPES.map((eventType) => (
                <SelectItem key={eventType.value} value={eventType.value}>
                  {eventType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="start-date">من تاريخ</Label>
          <Input
            id="start-date"
            type="date"
            value={localFilters.start_date || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                start_date: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="end-date">إلى تاريخ</Label>
          <Input
            id="end-date"
            type="date"
            value={localFilters.end_date || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                end_date: e.target.value || undefined,
              })
            }
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>تطبيق الفلاتر</Button>
      </div>
    </div>
  )
}
