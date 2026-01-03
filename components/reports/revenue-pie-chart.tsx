'use client'

import { Pie, PieChart, Cell, Legend } from 'recharts'
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
import { type RevenueBySectionDto } from '@/lib/types/report.types'
import { formatCurrency } from '@/lib/utils/currency'
import { ReportEmptyState } from './report-empty-state'

interface RevenuePieChartProps {
  data?: RevenueBySectionDto[]
  loading?: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function RevenuePieChart({ data, loading }: RevenuePieChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإيرادات حسب القسم</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportEmptyState message="لا توجد بيانات إيرادات" />
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = data.map((section) => ({
    name: section.section_name,
    value: Number(section.total_revenue),
    percentage: section.revenue_percentage,
  }))

  // Create chart config
  const chartConfig = data.reduce((acc, section, index) => {
    acc[section.section_name] = {
      label: section.section_name,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as ChartConfig)

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع الإيرادات حسب القسم</CardTitle>
        <CardDescription>نسبة مساهمة كل قسم في إجمالي الإيرادات</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.percentage.toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    String(name),
                  ]}
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => value}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
