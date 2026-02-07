'use client'

import Link from 'next/link'
import {
  IconShoppingCart,
  IconTable,
  IconToolsKitchen2,
  IconPackage,
  IconReport,
  IconTruck,
} from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

const quickAccessItems = [
  {
    title: 'طلب جديد',
    href: '/orders',
    icon: IconShoppingCart,
    roles: ['Admin', 'Manager', 'Waiter'],
    description: 'إنشاء طلب جديد',
  },
  {
    title: 'الطاولات',
    href: '/tables',
    icon: IconTable,
    roles: ['Admin', 'Manager', 'Waiter'],
    description: 'إدارة الطاولات',
  },
  {
    title: 'المطبخ',
    href: '/kitchen',
    icon: IconToolsKitchen2,
    roles: ['Admin', 'Kitchen'],
    description: 'عرض الطلبات المعلقة',
  },
  {
    title: 'الأصناف',
    href: '/items',
    icon: IconPackage,
    roles: ['Admin', 'Manager'],
    description: 'إدارة قائمة الطعام',
  },
  {
    title: 'التقارير',
    href: '/reports',
    icon: IconReport,
    roles: ['Admin', 'Manager'],
    description: 'التقارير والإحصائيات',
  },
  {
    title: 'التوصيل',
    href: '/deliveries',
    icon: IconTruck,
    roles: ['Admin', 'Delivery'],
    description: 'إدارة طلبات التوصيل',
  },
]

export function QuickAccessGrid() {
  const { user } = useAuth()

  const filteredItems = quickAccessItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    return user?.roles?.some((role) => item.roles.includes(role)) || false
  })

  if (filteredItems.length === 0) return null

  return (
    <div className="px-4 lg:px-6">
      <h2 className="mb-4 text-lg font-semibold">وصول سريع</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <Card className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
                <item.icon className="size-8 text-primary transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">{item.title}</span>
                <span className="hidden text-center text-xs text-muted-foreground @[200px]/card:block">
                  {item.description}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
