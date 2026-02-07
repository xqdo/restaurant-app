'use client'

import { useState } from 'react'
import { IconTrash, IconPlus, IconMinus } from '@tabler/icons-react'
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
  type StorageEntry,
  type StorageUsage,
  type StorageItem,
  type UsageReason,
  UNIT_LABELS,
  REASON_LABELS,
} from '@/lib/types/storage.types'
import { formatDateTime } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'

type MovementType = 'in' | 'out'

interface Movement {
  id: string
  type: MovementType
  itemName: string
  itemUnit: string
  quantity: number
  date: string
  notes?: string | null
  // Entry-specific
  unitPrice?: string | null
  vendorName?: string | null
  // Usage-specific
  reason?: UsageReason | null
  // For delete
  originalEntry?: StorageEntry
  originalUsage?: StorageUsage
}

interface StorageMovementsTabProps {
  entries: StorageEntry[]
  usages: StorageUsage[]
  storageItems: StorageItem[]
  loadingEntries: boolean
  loadingUsages: boolean
  onDeleteEntry: (entry: StorageEntry) => void
  onDeleteUsage: (usage: StorageUsage) => void
  onAddEntry: () => void
  onAddUsage: () => void
  onEntryFiltersChange: (filters: { storage_item_id?: number; supplier?: string }) => void
  onUsageFiltersChange: (filters: { storage_item_id?: number; reason?: string }) => void
}

const REASON_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'> = {
  production: 'default',
  waste: 'destructive',
  adjustment: 'secondary',
  expired: 'warning',
}

export function StorageMovementsTab({
  entries,
  usages,
  storageItems,
  loadingEntries,
  loadingUsages,
  onDeleteEntry,
  onDeleteUsage,
  onAddEntry,
  onAddUsage,
  onEntryFiltersChange,
  onUsageFiltersChange,
}: StorageMovementsTabProps) {
  const [filterItemId, setFilterItemId] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const loading = loadingEntries || loadingUsages

  const handleItemFilterChange = (value: string) => {
    setFilterItemId(value)
    const itemId = value !== 'all' ? Number(value) : undefined
    onEntryFiltersChange({ storage_item_id: itemId })
    onUsageFiltersChange({ storage_item_id: itemId })
  }

  // Merge entries and usages into a unified movements list
  const movements: Movement[] = []

  if (filterType === 'all' || filterType === 'in') {
    for (const entry of entries) {
      movements.push({
        id: `entry-${entry.id}`,
        type: 'in',
        itemName: entry.storageItem?.name || `#${entry.storage_item_id}`,
        itemUnit: entry.storageItem ? UNIT_LABELS[entry.storageItem.unit] : '',
        quantity: Number(entry.quantity),
        date: entry.entry_date,
        notes: entry.notes,
        unitPrice: entry.unit_price,
        vendorName: entry.vendor?.name || entry.supplier,
        originalEntry: entry,
      })
    }
  }

  if (filterType === 'all' || filterType === 'out') {
    for (const usage of usages) {
      movements.push({
        id: `usage-${usage.id}`,
        type: 'out',
        itemName: usage.storageItem?.name || `#${usage.storage_item_id}`,
        itemUnit: usage.storageItem ? UNIT_LABELS[usage.storageItem.unit] : '',
        quantity: Number(usage.quantity),
        date: usage.usage_date,
        notes: usage.notes,
        reason: usage.reason,
        originalUsage: usage,
      })
    }
  }

  // Sort by date descending (newest first)
  movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      {/* Filters and action buttons */}
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
        <Select value={filterType} onValueChange={setFilterType} dir="rtl">
          <SelectTrigger className="w-[140px] text-right">
            <SelectValue placeholder="كل الحركات" />
          </SelectTrigger>
          <SelectContent className="text-right">
            <SelectItem value="all">كل الحركات</SelectItem>
            <SelectItem value="in">إدخال فقط</SelectItem>
            <SelectItem value="out">صرف فقط</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 mr-auto">
          <Button onClick={onAddEntry} variant="outline" size="sm">
            <IconPlus className="h-4 w-4" />
            <span className="hidden sm:inline">إدخال</span>
          </Button>
          <Button onClick={onAddUsage} variant="outline" size="sm">
            <IconMinus className="h-4 w-4" />
            <span className="hidden sm:inline">صرف</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">لا توجد حركات</h3>
            <p className="text-muted-foreground max-w-sm">
              {filterItemId !== 'all' || filterType !== 'all'
                ? 'لا توجد نتائج مطابقة للفلتر.'
                : 'لم يتم تسجيل أي حركات مخزون بعد.'}
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">المادة</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">التفاصيل</TableHead>
              <TableHead className="text-right">الملاحظات</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right w-[50px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-right">
                  {movement.type === 'in' ? (
                    <Badge variant="success">إدخال</Badge>
                  ) : (
                    <Badge variant="destructive">صرف</Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium text-right">
                  {movement.itemName}
                  {movement.itemUnit && (
                    <span className="text-xs text-muted-foreground mr-1">
                      ({movement.itemUnit})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className={movement.type === 'in' ? 'text-emerald-600' : 'text-red-600'}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {movement.type === 'in' ? (
                    <div className="space-y-0.5">
                      {movement.vendorName && (
                        <div className="text-muted-foreground">{movement.vendorName}</div>
                      )}
                      {movement.unitPrice && (
                        <div className="text-muted-foreground">{formatCurrency(movement.unitPrice)}</div>
                      )}
                    </div>
                  ) : (
                    movement.reason ? (
                      <Badge variant={REASON_BADGE_VARIANT[movement.reason] || 'outline'}>
                        {REASON_LABELS[movement.reason]}
                      </Badge>
                    ) : '—'
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {movement.notes || '—'}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatDateTime(movement.date)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
                    onClick={() => {
                      if (movement.originalEntry) onDeleteEntry(movement.originalEntry)
                      if (movement.originalUsage) onDeleteUsage(movement.originalUsage)
                    }}
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
