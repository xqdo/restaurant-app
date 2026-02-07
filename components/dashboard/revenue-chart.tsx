'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { subDays } from 'date-fns'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

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
import { formatDateForAPI } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { PeriodSalesReportDto } from '@/lib/types/report.types'

const chartConfig = {
  revenue: {
    label: 'الإيرادات',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function RevenueChart() {
  const [data, setData] = React.useState<PeriodSalesReportDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const end = formatDateForAPI(new Date())
    const start = formatDateForAPI(subDays(new Date(), 6))
    apiClient
      .get<PeriodSalesReportDto>(
        `${REPORTS_ENDPOINTS.salesPeriod}?start=${start}&end=${end}&period=7days`
      )
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  const chartData = React.useMemo(() => {
    if (!data?.daily_breakdown) return []
    return data.daily_breakdown.map((day) => ({
      date: day.date,
      revenue: day.revenue,
    }))
  }, [data])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>اتجاه الإيرادات</CardTitle>
        <CardDescription>آخر ٧ أيام</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground">
            لا تتوفر بيانات
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  try {
                    return format(parseISO(value), 'EEEE', { locale: ar })
                  } catch {
                    return value
                  }
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      try {
                        return format(parseISO(value), 'dd MMMM', {
                          locale: ar,
                        })
                      } catch {
                        return value
                      }
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
