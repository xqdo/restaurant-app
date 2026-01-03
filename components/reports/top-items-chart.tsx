'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { type TopItemDto } from '@/lib/types/report.types'
import { formatCurrency } from '@/lib/utils/currency'
import { ReportEmptyState } from './report-empty-state'

interface TopItemsChartProps {
  title: string
  description?: string
  data?: TopItemDto[]
  loading?: boolean
  type: 'top' | 'slow'
}

export function TopItemsChart({
  title,
  description,
  data,
  loading,
  type,
}: TopItemsChartProps) {
  const chartConfig = {
    quantity_sold: {
      label: 'الكمية المباعة',
      color: type === 'top' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
    },
  } satisfies ChartConfig

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportEmptyState message="لا توجد بيانات" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'quantity_sold') {
                      return [`${value} وحدة`, 'الكمية']
                    }
                    return [value, name]
                  }}
                />
              }
            />
            <Bar
              dataKey="quantity_sold"
              fill="var(--color-quantity_sold)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Data Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">الإيرادات</TableHead>
                <TableHead className="text-right">السعر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity_sold.toLocaleString('ar-SA')}</TableCell>
                  <TableCell>{formatCurrency(item.revenue)}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
