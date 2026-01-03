import { Badge } from '@/components/ui/badge'
import type { TableStatus } from '@/lib/types/table.types'

interface TableStatusBadgeProps {
  status: TableStatus
  onClick?: () => void
}

export function TableStatusBadge({ status, onClick }: TableStatusBadgeProps) {
  const config = {
    AVAILABLE: {
      variant: 'default' as const,
      label: 'متاح',
      emoji: '🟢',
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    OCCUPIED: {
      variant: 'destructive' as const,
      label: 'مشغول',
      emoji: '🔴',
      className: 'bg-red-500 hover:bg-red-600 text-white',
    },
    RESERVED: {
      variant: 'default' as const,
      label: 'محجوز',
      emoji: '🟡',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
  }[status]

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {config.emoji} {config.label}
    </Badge>
  )
}
