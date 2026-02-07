'use client'

import * as React from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'

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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { formatCurrency } from '@/lib/utils/currency'
import type { RevenueBySectionReportDto } from '@/lib/types/report.types'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function RevenueBySectionChart() {
  const [data, setData] = React.useState<RevenueBySectionReportDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    apiClient
      .get<RevenueBySectionReportDto>(
        `${REPORTS_ENDPOINTS.revenueBySection}?period=7days`
      )
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  const { chartData, chartConfig } = React.useMemo(() => {
    if (!data?.sections?.length) {
      return { chartData: [], chartConfig: {} as ChartConfig }
    }

    const config: ChartConfig = {}
    const items = data.sections.map((section, index) => {
      const key = `section_${index}`
      config[key] = {
        label: section.section_name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
      return {
        name: section.section_name,
        value: section.total_revenue,
        percentage: section.revenue_percentage,
        fill: CHART_COLORS[index % CHART_COLORS.length],
        key,
      }
    })

    return { chartData: items, chartConfig: config }
  }, [data])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>الإيرادات حسب الأقسام</CardTitle>
        <CardDescription>آخر ٧ أيام</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            لا تتوفر بيانات
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    indicator="dot"
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-bold"
                          >
                            {formatCurrency(data?.total_revenue ?? 0)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            الإجمالي
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
