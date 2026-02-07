'use client'

import { useState } from 'react'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type StorageUsage,
  type StorageItem,
  type UsageReason,
  UNIT_LABELS,
  REASON_LABELS,
} from '@/lib/types/storage.types'
import { type UsageFilters } from '@/app/inventory/page'
import { formatDateTime } from '@/lib/utils/date'

interface StorageUsagesTabProps {
  usages: StorageUsage[]
  storageItems: StorageItem[]
  loading: boolean
  onDelete: (usage: StorageUsage) => void
  onFiltersChange: (filters: UsageFilters) => void
  onAddUsage: () => void
}

const REASON_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'> = {
  production: 'default',
  waste: 'destructive',
  adjustment: 'secondary',
  expired: 'warning',
}

const REASONS: UsageReason[] = ['production', 'waste', 'adjustment', 'expired']

export function StorageUsagesTab({
  usages,
  storageItems,
  loading,
  onDelete,
  onFiltersChange,
  onAddUsage,
}: StorageUsagesTabProps) {
  const [filterItemId, setFilterItemId] = useState<string>('all')
  const [filterReason, setFilterReason] = useState<string>('all')

  const handleItemFilterChange = (value: string) => {
    setFilterItemId(value)
    onFiltersChange({
      storage_item_id: value !== 'all' ? Number(value) : undefined,
      reason: filterReason !== 'all' ? filterReason : undefined,
    })
  }

  const handleReasonFilterChange = (value: string) => {
    setFilterReason(value)
    onFiltersChange({
      storage_item_id: filterItemId !== 'all' ? Number(filterItemId) : undefined,
      reason: value !== 'all' ? value : undefined,
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters and add button */}
      <div className="flex flex-wrap items-center gap-3" dir="rtl">
        <Select value={filterItemId} onValueChange={handleItemFilterChange} dir="rtl">
          <SelectTrigger className="w-[180px] text-right">
            <SelectValue placeholder="كل المواد" />
          </SelectTrigger>
          <SelectContent className="text-right">
            <SelectItem value="all">كل المواد</SelectItem>
            {storageItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterReason} onValueChange={handleReasonFilterChange} dir="rtl">
          <SelectTrigger className="w-[160px] text-right">
            <SelectValue placeholder="كل الأسباب" />
          </SelectTrigger>
          <SelectContent className="text-right">
            <SelectItem value="all">كل الأسباب</SelectItem>
            {REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {REASON_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onAddUsage} className="mr-auto">
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">تسجيل صرف</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : usages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">لا توجد عمليات صرف</h3>
            <p className="text-muted-foreground max-w-sm">
              {filterItemId !== 'all' || filterReason !== 'all'
                ? 'لا توجد نتائج مطابقة للبحث.'
                : 'لم يتم تسجيل أي عمليات صرف من المخزون بعد.'}
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المادة</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">السبب</TableHead>
              <TableHead className="text-right">الملاحظات</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right w-[50px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usages.map((usage) => (
              <TableRow key={usage.id}>
                <TableCell className="font-medium text-right">
                  {usage.storageItem?.name || `#${usage.storage_item_id}`}
                  {usage.storageItem && (
                    <span className="text-xs text-muted-foreground mr-1">
                      ({UNIT_LABELS[usage.storageItem.unit]})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">{Number(usage.quantity)}</TableCell>
                <TableCell className="text-right">
                  {usage.reason ? (
                    <Badge variant={REASON_BADGE_VARIANT[usage.reason] || 'outline'}>
                      {REASON_LABELS[usage.reason]}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {usage.notes || '—'}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatDateTime(usage.usage_date)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
                    onClick={() => onDelete(usage)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
