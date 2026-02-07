/**
 * Custom hook for printing receipts
 * Uses react-to-print for reliable printing
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints'
import type { ReceiptDetail } from '@/lib/types/receipt.types'

export function usePrintReceipt() {
  const [isPrinting, setIsPrinting] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptDetail | null>(null)
  const [shouldPrint, setShouldPrint] = useState(false)
  const [printType, setPrintType] = useState<'order' | 'final'>('final')
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${printType === 'order' ? 'Order' : 'Receipt'}-${receiptData?.number || 'print'}`,
    onAfterPrint: () => {
      setIsPrinting(false)
      setReceiptData(null)
      setShouldPrint(false)
      setPrintType('final')
      toast.success('تم فتح نافذة الطباعة')
    },
    pageStyle: `
      @media print {
        @page {
          margin: 0;
          size: 80mm auto;
        }
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  })

  // Trigger print when receipt data is ready and shouldPrint is true
  useEffect(() => {
    if (receiptData && shouldPrint && printRef.current) {
      // Small delay to ensure DOM is fully updated
      const timer = setTimeout(() => {
        handlePrint()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [receiptData, shouldPrint, handlePrint])

  const printReceipt = useCallback(async (receiptId: number, type: 'order' | 'final' = 'final') => {
    if (isPrinting) return

    setIsPrinting(true)
    setShouldPrint(false)
    setPrintType(type)

    try {
      // Fetch receipt details from API
      const response = await apiClient.get<any>(
        ORDER_ENDPOINTS.receiptById(receiptId)
      )

      // Transform backend response to match ReceiptDetail interface
      const transformedReceipt: ReceiptDetail = {
        id: response.id,
        number: response.number,
        is_delivery: response.is_delivery,
        customer_name: response.customer_name,
        phone_number: response.phone_number,
        location: response.location,
        table: response.table,
        items: (response.receiptItems || []).map((item: any) => ({
          id: item.id,
          item_id: item.item_id,
          item_name: item.item?.name || 'غير معروف',
          quantity: parseInt(item.quantity) || 1,
          unit_price: item.unit_price || '0',
          subtotal: item.subtotal || '0',
          status: item.status,
          notes: item.notes,
        })),
        subtotal: response.subtotal || '0',
        discount_amount: response.discount_amount || '0',
        total: response.total || '0',
        applied_discounts: response.applied_discounts || [],
        notes: response.notes,
        created_by_name: response.baseEntity?.createdByUser?.fullname || 'غير معروف',
        created_at: response.baseEntity?.created_at || '',
        completed_at: response.completed_at,
      }

      setReceiptData(transformedReceipt)
      // Trigger the print effect
      setShouldPrint(true)
    } catch (error) {
      console.error('Failed to fetch receipt:', error)
      toast.error('فشل تحميل بيانات الفاتورة')
      setIsPrinting(false)
      setShouldPrint(false)
    }
  }, [isPrinting])

  return { printReceipt, isPrinting, receiptData, printRef, printType }
}
