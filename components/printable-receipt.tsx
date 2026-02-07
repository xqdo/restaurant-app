/**
 * Printable Receipt Component
 * Optimized for 80mm thermal printers
 * Hidden by default, only visible when printing
 */

import type { ReceiptDetail } from '@/lib/types/receipt.types'

interface PrintableReceiptProps {
  receipt: ReceiptDetail
}

export function PrintableReceipt({ receipt }: PrintableReceiptProps) {
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

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined || price === null) return '0'
    const parsed = typeof price === 'number' ? price : parseFloat(price)
    if (isNaN(parsed)) return '0'
    // Format with thousand separators, no decimals
    return parsed.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })
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
        fontSize: '12px',
        lineHeight: '1.4',
        padding: '10px',
        direction: 'rtl',
      }}
    >
      {/* Restaurant Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
          مطعم
        </div>
        <div style={{ fontSize: '14px', marginBottom: '3px' }}>
          Restaurant Management System
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
      </div>

      {/* Receipt Info */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span>رقم الفاتورة:</span>
          <span style={{ fontWeight: 'bold' }}>{receipt.number}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span>نوع الطلب:</span>
          <span>{getOrderType()}</span>
        </div>
        {receipt.table && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>الطاولة:</span>
            <span>طاولة {receipt.table.number}</span>
          </div>
        )}
        {receipt.is_delivery && receipt.customer_name && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>العميل:</span>
              <span>{receipt.customer_name}</span>
            </div>
            {receipt.phone_number && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>الهاتف:</span>
                <span>{receipt.phone_number}</span>
              </div>
            )}
            {receipt.location && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>العنوان:</span>
                <span style={{ maxWidth: '60%', textAlign: 'left' }}>{receipt.location}</span>
              </div>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span>التاريخ:</span>
          <span style={{ fontSize: '11px' }}>{formatDate(receipt.created_at)}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Items List */}
      <div style={{ marginBottom: '15px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            marginBottom: '8px',
            borderBottom: '1px solid #000',
            paddingBottom: '3px',
          }}
        >
          <span style={{ width: '45%' }}>الصنف</span>
          <span style={{ width: '15%', textAlign: 'center' }}>الكمية</span>
          <span style={{ width: '20%', textAlign: 'center' }}>السعر</span>
          <span style={{ width: '20%', textAlign: 'left' }}>المجموع</span>
        </div>

        {receipt.items?.map((item) => (
          <div key={item.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
              }}
            >
              <span style={{ width: '45%' }}>{item.item_name}</span>
              <span style={{ width: '15%', textAlign: 'center' }}>{item.quantity}</span>
              <span style={{ width: '20%', textAlign: 'center' }}>{formatPrice(item.unit_price)}</span>
              <span style={{ width: '20%', textAlign: 'left', fontWeight: 'bold' }}>
                {formatPrice(item.subtotal)}
              </span>
            </div>
            {item.notes && (
              <div
                style={{
                  fontSize: '10px',
                  color: '#666',
                  marginBottom: '5px',
                  paddingRight: '10px',
                }}
              >
                ملاحظة: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Order Notes */}
      {receipt.notes && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>ملاحظات الطلب:</div>
            <div style={{ fontSize: '11px', paddingRight: '10px' }}>{receipt.notes}</div>
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
        </>
      )}

      {/* Totals */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>المجموع الفرعي:</span>
          <span style={{ fontWeight: 'bold' }}>{formatPrice(receipt.subtotal)} د.ع</span>
        </div>

        {receipt.applied_discounts && receipt.applied_discounts.length > 0 && (
          <>
            {receipt.applied_discounts.map((discount, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '3px',
                  fontSize: '11px',
                }}
              >
                <span>خصم ({discount.discount_name}):</span>
                <span>-{formatPrice(discount.amount_saved)} د.ع</span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
                color: '#666',
              }}
            >
              <span>إجمالي الخصم:</span>
              <span>-{formatPrice(receipt.discount_amount)} د.ع</span>
            </div>
          </>
        )}

        <div
          style={{
            borderTop: '2px solid #000',
            marginTop: '8px',
            paddingTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>الإجمالي:</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatPrice(receipt.total)} د.ع</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
          شكراً لزيارتكم
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>نتطلع لخدمتكم مرة أخرى</div>
      </div>
    </div>
  )
}
