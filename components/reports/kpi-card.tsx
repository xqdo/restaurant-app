import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number // percentage
    direction: 'up' | 'down'
  }
  loading?: boolean
  className?: string
}

export function KpiCard({
  title,
  value,
  icon,
  trend,
  loading,
  className,
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40 mb-2" />
          {trend && <Skeleton className="h-4 w-20" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium mt-1',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.direction === 'up' ? (
              <IconTrendingUp className="h-4 w-4" />
            ) : (
              <IconTrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
