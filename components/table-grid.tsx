import { TableCard } from '@/components/table-card'
import type { Table, TableStatus } from '@/lib/types/table.types'

interface TableGridProps {
  tables: Table[]
  onStatusChange: (tableId: number, newStatus: TableStatus) => Promise<void>
  onDelete: (tableId: number) => Promise<void>
  canManage: boolean
}

export function TableGrid({
  tables,
  onStatusChange,
  onDelete,
  canManage,
}: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">لا توجد طاولات</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  )
}
