/**
 * Discount Form Component
 * Create/Edit discount with validation and conditional fields
 */

'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { apiClient } from '@/lib/api/client'
import { DISCOUNT_ENDPOINTS, MENU_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  Discount,
  DiscountType,
  CreateDiscountDto,
  UpdateDiscountDto,
} from '@/lib/types/discount.types'

interface MenuItem {
  id: number
  name: string
}

interface DiscountFormProps {
  discount?: Discount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
]

export function DiscountForm({
  discount,
  open,
  onOpenChange,
  onSuccess,
}: DiscountFormProps) {
  const isMobile = useIsMobile()

  // Basic fields
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<DiscountType>('amount')

  // Value fields (conditional)
  const [amount, setAmount] = useState('')
  const [percentage, setPercentage] = useState('')

  // Validity period
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Usage limit
  const [maxReceipts, setMaxReceipts] = useState('')

  // Conditions
  const [minAmount, setMinAmount] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  // Combo items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])

  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(false)

  // Fetch menu items for combo type
  useEffect(() => {
    if (open && type === 'combo') {
      fetchMenuItems()
    }
  }, [open, type])

  // Reset form when discount changes or dialog opens
  useEffect(() => {
    if (open) {
      if (discount) {
        setName(discount.name)
        setCode(discount.code)
        setType(discount.type)
        setAmount(discount.amount || '')
        setPercentage(discount.persentage?.toString() || '')

        // Convert ISO datetime to datetime-local format
        setStartDate(discount.start_date.slice(0, 16))
        setEndDate(discount.end_date.slice(0, 16))

        setMaxReceipts(discount.max_receipts?.toString() || '')

        // Extract conditions
        const minAmountCondition = discount.conditions?.find(
          (c) => c.condition_type === 'min_amount'
        )
        setMinAmount(minAmountCondition?.value || '')

        const daysCondition = discount.conditions?.find(
          (c) => c.condition_type === 'day_of_week'
        )
        if (daysCondition) {
          try {
            const days = JSON.parse(daysCondition.value) as number[]
            setSelectedDays(days)
          } catch {
            setSelectedDays([])
          }
        } else {
          setSelectedDays([])
        }

        // Extract combo items
        setSelectedItemIds(discount.items?.map((item) => item.item_id) || [])
      } else {
        // Reset for new discount
        setName('')
        setCode('')
        setType('amount')
        setAmount('')
        setPercentage('')
        setStartDate('')
        setEndDate('')
        setMaxReceipts('')
        setMinAmount('')
        setSelectedDays([])
        setSelectedItemIds([])
      }
    }
  }, [discount, open])

  const fetchMenuItems = async () => {
    try {
      setLoadingItems(true)
      const data = await apiClient.get<MenuItem[]>(MENU_ENDPOINTS.items)
      setMenuItems(data)
    } catch (error) {
      toast.error('فشل تحميل قائمة المنتجات')
    } finally {
      setLoadingItems(false)
    }
  }

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleItemToggle = (itemId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error('اسم الخصم مطلوب')
      return false
    }

    if (!code.trim()) {
      toast.error('كود الخصم مطلوب')
      return false
    }

    // Validate code format (uppercase alphanumeric)
    if (!/^[A-Z0-9_]+$/.test(code)) {
      toast.error('كود الخصم يجب أن يحتوي على أحرف إنجليزية كبيرة وأرقام فقط')
      return false
    }

    // Validate value based on type
    if (type === 'amount') {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error('قيمة الخصم يجب أن تكون أكبر من صفر')
        return false
      }
    } else if (type === 'percentage') {
      const pct = parseFloat(percentage)
      if (!percentage || pct <= 0 || pct > 100) {
        toast.error('النسبة المئوية يجب أن تكون بين 0 و 100')
        return false
      }
    } else if (type === 'combo') {
      if (selectedItemIds.length === 0) {
        toast.error('يجب اختيار منتج واحد على الأقل للعرض')
        return false
      }
    }

    // Validate dates
    if (!startDate || !endDate) {
      toast.error('تاريخ البداية والنهاية مطلوبان')
      return false
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const body: CreateDiscountDto | UpdateDiscountDto = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      }

      // Add value based on type
      if (type === 'amount') {
        body.amount = parseFloat(amount)
      } else if (type === 'percentage') {
        body.persentage = parseFloat(percentage)
      }

      // Add optional fields
      if (maxReceipts) {
        body.max_receipts = parseInt(maxReceipts)
      }

      // Add conditions if provided
      if (minAmount || selectedDays.length > 0) {
        body.conditions = {}

        if (minAmount) {
          body.conditions.min_amount = parseFloat(minAmount)
        }

        if (selectedDays.length > 0) {
          body.conditions.day_of_week = selectedDays
        }
      }

      // Add combo items if type is combo
      if (type === 'combo' && selectedItemIds.length > 0) {
        body.item_ids = selectedItemIds
      }

      // Make API call
      if (discount) {
        await apiClient.put<Discount>(
          DISCOUNT_ENDPOINTS.discountById(discount.id),
          body
        )
        toast.success('تم تحديث الخصم بنجاح')
      } else {
        await apiClient.post<Discount>(DISCOUNT_ENDPOINTS.discounts, body)
        toast.success('تم إضافة الخصم بنجاح')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'left'}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {discount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
          </DrawerTitle>
          <DrawerDescription>
            {discount
              ? 'قم بتحديث معلومات الخصم'
              : 'أضف خصماً جديداً للنظام'}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">المعلومات الأساسية</h3>

              <div className="space-y-2">
                <Label htmlFor="name">اسم الخصم *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: خصم الصيف"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">كود الخصم *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: SUMMER20"
                  required
                  disabled={loading}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  أحرف إنجليزية كبيرة وأرقام فقط
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">نوع الخصم *</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as DiscountType)}
                  disabled={loading}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">قيمة ثابتة</SelectItem>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                    <SelectItem value="combo">عرض مجموعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Value Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">القيمة</h3>

              {type === 'amount' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">قيمة الخصم *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {type === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="percentage">النسبة المئوية *</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="0"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {type === 'combo' && (
                <div className="space-y-2">
                  <Label>المنتجات المشمولة *</Label>
                  {loadingItems ? (
                    <p className="text-sm text-muted-foreground">
                      جاري التحميل...
                    </p>
                  ) : (
                    <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                      {menuItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedItemIds.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                            disabled={loading}
                          />
                          <Label
                            htmlFor={`item-${item.id}`}
                            className="cursor-pointer flex-1"
                          >
                            {item.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Validity Period */}
            <div className="space-y-4">
              <h3 className="font-semibold">الفترة الصالحة</h3>

              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ النهاية *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div className="space-y-4">
              <h3 className="font-semibold">حد الاستخدام</h3>

              <div className="space-y-2">
                <Label htmlFor="maxReceipts">الحد الأقصى للاستخدام</Label>
                <Input
                  id="maxReceipts"
                  type="number"
                  min="1"
                  value={maxReceipts}
                  onChange={(e) => setMaxReceipts(e.target.value)}
                  placeholder="غير محدود"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  اتركه فارغاً للسماح باستخدام غير محدود
                </p>
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-4">
              <h3 className="font-semibold">الشروط (اختياري)</h3>

              <div className="space-y-2">
                <Label htmlFor="minAmount">الحد الأدنى للمبلغ</Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>الأيام الصالحة</Label>
                <div className="border rounded-md p-3 space-y-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`day-${day.value}`}
                        className="cursor-pointer flex-1"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  اتركه فارغاً للسماح في جميع الأيام
                </p>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'جاري الحفظ...'
                : discount
                ? 'تحديث الخصم'
                : 'إضافة الخصم'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button" disabled={loading}>
                إلغاء
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
