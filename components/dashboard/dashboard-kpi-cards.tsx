'use client'

import * as React from 'react'
import {
  IconCash,
  IconReceipt,
  IconChartBar,
  IconBuildingStore,
  IconTruck,
} from '@tabler/icons-react'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateForAPI } from '@/lib/utils/date'
import { formatArabicNumber } from '@/lib/utils'
import type { SalesReportDto } from '@/lib/types/report.types'

export function DashboardKpiCards() {
  const [data, setData] = React.useState<SalesReportDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const today = formatDateForAPI(new Date())
    apiClient
      .get<SalesReportDto>(REPORTS_ENDPOINTS.salesDaily(today))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5">
              <Skeleton className="h-4 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCash className="size-4" />
            إيرادات اليوم
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data ? formatCurrency(data.total_revenue) : '--'}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">الإجمالي لهذا اليوم</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconReceipt className="size-4" />
            طلبات اليوم
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data ? formatArabicNumber(data.total_receipts) : '--'}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">عدد الطلبات المنجزة</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconChartBar className="size-4" />
            متوسط قيمة الطلب
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data ? formatCurrency(data.average_order_value) : '--'}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">المتوسط لكل طلب</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBuildingStore className="size-4" />
            <IconTruck className="size-4" />
            محلي / توصيل
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data
              ? `${formatArabicNumber(data.dine_in_orders)} / ${formatArabicNumber(data.delivery_orders)}`
              : '--'}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">توزيع الطلبات</div>
        </CardFooter>
      </Card>
    </div>
  )
}
