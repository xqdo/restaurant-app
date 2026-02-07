/**
 * Printable Order Ticket Component
 * Simpler receipt for order creation (kitchen copy / customer order confirmation)
 * Optimized for 80mm thermal printers
 * Shows order details without payment/totals information
 */

import type { ReceiptDetail } from '@/lib/types/receipt.types'

interface PrintableOrderTicketProps {
  receipt: ReceiptDetail
}

export function PrintableOrderTicket({ receipt }: PrintableOrderTicketProps) {
  // Safety check - don't render if receipt is incomplete
  if (!receipt || !receipt.number) {
    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch (error) {
      return '-'
    }
  }

  const getOrderType = () => {
    if (receipt.is_delivery) return 'توصيل'
    if (receipt.table) return 'محلي'
    return 'سفري'
  }

  return (
    <div
      className="print-content"
      style={{
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '1.5',
        padding: '10px',
        direction: 'rtl',
      }}
    >
      {/* Restaurant Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
          مطعم
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          إيصال طلب
        </div>
        <div style={{ borderTop: '2px solid #000', margin: '10px 0' }}></div>
      </div>

      {/* Receipt Info */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>رقم الطلب:</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{receipt.number}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>نوع الطلب:</span>
          <span style={{ fontWeight: 'bold' }}>{getOrderType()}</span>
        </div>
        {receipt.table && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>الطاولة:</span>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>طاولة {receipt.table.number}</span>
          </div>
        )}
        {receipt.is_delivery && receipt.customer_name && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>العميل:</span>
              <span style={{ fontWeight: 'bold' }}>{receipt.customer_name}</span>
            </div>
            {receipt.phone_number && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>الهاتف:</span>
                <span>{receipt.phone_number}</span>
              </div>
            )}
            {receipt.location && (
              <div style={{ marginBottom: '5px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>العنوان:</div>
                <div style={{ paddingRight: '10px', fontSize: '12px' }}>{receipt.location}</div>
              </div>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>التاريخ:</span>
          <span style={{ fontSize: '11px' }}>{formatDate(receipt.created_at)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>الموظف:</span>
          <span>{receipt.created_by_name}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px solid #000', margin: '10px 0' }}></div>

      {/* Items List - Simpler format for kitchen */}
      <div style={{ marginBottom: '15px' }}>
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '10px',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          الأصناف المطلوبة
        </div>

        {receipt.items?.map((item) => (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
                fontSize: '14px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>{item.item_name}</span>
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  backgroundColor: '#000',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '3px',
                }}
              >
                × {item.quantity}
              </span>
            </div>
            {item.notes && (
              <div
                style={{
                  fontSize: '12px',
                  backgroundColor: '#f0f0f0',
                  padding: '5px',
                  marginTop: '3px',
                  borderRight: '3px solid #000',
                  paddingRight: '8px',
                }}
              >
                ⚠ ملاحظة: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px solid #000', margin: '10px 0' }}></div>

      {/* Order Notes */}
      {receipt.notes && (
        <>
          <div
            style={{
              marginBottom: '15px',
              backgroundColor: '#f0f0f0',
              padding: '8px',
              borderRight: '4px solid #000',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>
              ملاحظات الطلب:
            </div>
            <div style={{ fontSize: '12px', paddingRight: '5px' }}>{receipt.notes}</div>
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
        </>
      )}

      {/* Summary */}
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>إجمالي الأصناف: </span>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
            {receipt.items?.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px solid #000', margin: '10px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <div style={{ fontSize: '13px', marginBottom: '5px' }}>
          إيصال مبدئي - سيتم الحساب عند الانتهاء
        </div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
          {receipt.is_delivery ? 'في انتظار التوصيل' : 'في انتظار التحضير'}
        </div>
      </div>
    </div>
  )
}
