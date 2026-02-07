'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { formatCurrency } from '@/lib/utils/currency'
import type { TopItemsReportDto } from '@/lib/types/report.types'

const chartConfig = {
  quantity: {
    label: 'الكمية المباعة',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function TopSellingItemsChart() {
  const [data, setData] = React.useState<TopItemsReportDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    apiClient
      .get<TopItemsReportDto>(
        `${REPORTS_ENDPOINTS.topSelling}?period=7days&limit=5`
      )
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  const chartData = React.useMemo(() => {
    if (!data?.items) return []
    return data.items.map((item) => ({
      name: item.name,
      quantity: item.quantity_sold,
      revenue: item.revenue,
    }))
  }, [data])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>الأصناف الأكثر مبيعاً</CardTitle>
        <CardDescription>آخر ٧ أيام</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            لا تتوفر بيانات
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart data={chartData} layout="vertical" margin={{ right: 16 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 12 }}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === 'quantity') return `${value}`
                      return formatCurrency(value as number)
                    }}
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey="quantity"
                fill="var(--color-quantity)"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
