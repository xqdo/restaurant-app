'use client'

import { useState } from 'react'
import { IconTrash, IconSearch, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { type StorageEntry, type StorageItem, UNIT_LABELS } from '@/lib/types/storage.types'
import { type EntryFilters } from '@/app/inventory/page'
import { formatDateTime } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'

interface StorageEntriesTabProps {
  entries: StorageEntry[]
  storageItems: StorageItem[]
  loading: boolean
  onDelete: (entry: StorageEntry) => void
  onFiltersChange: (filters: EntryFilters) => void
  onAddEntry: () => void
}

export function StorageEntriesTab({
  entries,
  storageItems,
  loading,
  onDelete,
  onFiltersChange,
  onAddEntry,
}: StorageEntriesTabProps) {
  const [filterItemId, setFilterItemId] = useState<string>('all')
  const [search, setSearch] = useState('')

  const handleItemFilterChange = (value: string) => {
    setFilterItemId(value)
    onFiltersChange({
      storage_item_id: value !== 'all' ? Number(value) : undefined,
      supplier: search || undefined,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFiltersChange({
      storage_item_id: filterItemId !== 'all' ? Number(filterItemId) : undefined,
      supplier: value || undefined,
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3" dir="rtl">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالمورد..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-9 text-right"
          />
        </div>
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
        <Button onClick={onAddEntry} className="mr-auto">
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة مخزون</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">لا توجد إدخالات</h3>
            <p className="text-muted-foreground max-w-sm">
              {filterItemId !== 'all' || search
                ? 'لا توجد نتائج مطابقة للبحث.'
                : 'لم يتم تسجيل أي عمليات إدخال مخزون بعد.'}
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المادة</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">سعر الوحدة</TableHead>
              <TableHead className="text-right">المورد</TableHead>
              <TableHead className="text-right">الملاحظات</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right w-[50px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium text-right">
                  {entry.storageItem?.name || `#${entry.storage_item_id}`}
                  {entry.storageItem && (
                    <span className="text-xs text-muted-foreground mr-1">
                      ({UNIT_LABELS[entry.storageItem.unit]})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">{Number(entry.quantity)}</TableCell>
                <TableCell className="text-right">
                  {entry.unit_price ? formatCurrency(entry.unit_price) : '—'}
                </TableCell>
                <TableCell className="text-right">{entry.supplier || '—'}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {entry.notes || '—'}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatDateTime(entry.entry_date)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
                    onClick={() => onDelete(entry)}
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
