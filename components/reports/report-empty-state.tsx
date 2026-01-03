import { IconChartBar } from '@tabler/icons-react'

interface ReportEmptyStateProps {
  message?: string
  description?: string
}

export function ReportEmptyState({ message, description }: ReportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border rounded-lg p-12 text-center">
      <IconChartBar className="h-16 w-16 text-muted-foreground mb-4" stroke={1.5} />
      <p className="text-lg text-muted-foreground">
        {message || 'لا توجد بيانات للفترة المحددة'}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {description || 'جرب تغيير الفترة الزمنية أو الفلاتر'}
      </p>
    </div>
  )
}
