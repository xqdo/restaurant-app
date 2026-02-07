'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { type ReportSummary } from '@/lib/types/report.types'

interface ReportSummaryProps {
  summary: ReportSummary
  loading: boolean
}

export function ReportSummary({ summary, loading }: ReportSummaryProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">ملخص التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader>
        <CardTitle className="text-right">ملخص التقرير</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نوع الطلب</TableHead>
              <TableHead className="text-right">مدفوع (عدد)</TableHead>
              <TableHead className="text-right">مدفوع (مبلغ)</TableHead>
              <TableHead className="text-right">غير مدفوع (عدد)</TableHead>
              <TableHead className="text-right">غير مدفوع (مبلغ)</TableHead>
              <TableHead className="text-right">الإجمالي (عدد)</TableHead>
              <TableHead className="text-right">الإجمالي (مبلغ)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.byOrderType.map((row) => (
              <TableRow key={row.orderType}>
                <TableCell className="font-medium text-right">{row.label}</TableCell>
                <TableCell className="text-right">{row.paidCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.paidTotal)}</TableCell>
                <TableCell className="text-right">{row.unpaidCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.unpaidTotal)}</TableCell>
                <TableCell className="text-right font-semibold">{row.totalCount}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(row.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell className="text-right">المجموع</TableCell>
              <TableCell className="text-right">{summary.totalPaid}</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.paidRevenue)}</TableCell>
              <TableCell className="text-right">{summary.totalUnpaid}</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.unpaidRevenue)}</TableCell>
              <TableCell className="text-right">{summary.totalReceipts}</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.totalRevenue)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
