import { Badge } from '@/components/ui/badge'

interface RoleBadgeProps {
  role: string
}

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-red-500 hover:bg-red-600 text-white',
  Manager: 'bg-blue-500 hover:bg-blue-600 text-white',
  Waiter: 'bg-green-500 hover:bg-green-600 text-white',
  Kitchen: 'bg-orange-500 hover:bg-orange-600 text-white',
  Cashier: 'bg-purple-500 hover:bg-purple-600 text-white',
  Delivery: 'bg-yellow-500 hover:bg-yellow-600 text-white',
}

const ROLE_LABELS_AR: Record<string, string> = {
  Admin: 'مدير النظام',
  Manager: 'مدير',
  Waiter: 'نادل',
  Kitchen: 'مطبخ',
  Cashier: 'أمين الصندوق',
  Delivery: 'توصيل',
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colorClass = ROLE_COLORS[role] || 'bg-gray-500 hover:bg-gray-600 text-white'
  const label = ROLE_LABELS_AR[role] || role

  return (
    <Badge className={colorClass} variant="secondary">
      {label}
    </Badge>
  )
}
