/**
 * Order Form Component - REFACTORED
 * Streamlined single-screen order creation with better UX
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { IconMinus, IconPlus, IconTrash, IconSearch, IconTable } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS, TABLE_ENDPOINTS, MENU_ENDPOINTS } from '@/lib/api/endpoints'
import type { CreateReceiptDto } from '@/lib/types/receipt.types'
import type { MenuItem, MenuSection } from '@/lib/types/menu.types'
import { formatCurrency } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { TableStatusBadge } from '@/components/table-status-badge'

interface OrderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface Table {
  id: number
  number: number
  status: string
}

interface OrderItem {
  item: MenuItem
  quantity: number
  notes: string
}

export function OrderForm({ open, onOpenChange, onSuccess }: OrderFormProps) {

  // Order type state
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in')

  // Dine-in state
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTableId, setSelectedTableId] = useState<string>('')

  // Delivery state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')

  // Menu data
  const [sections, setSections] = useState<MenuSection[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Order state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderNotes, setOrderNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch data when drawer opens
  useEffect(() => {
    if (open) {
      fetchMenuData()
      if (orderType === 'dine-in') {
        fetchAvailableTables()
      }
    }
  }, [open, orderType])

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setOrderType('dine-in')
      setSelectedTableId('')
      setPhoneNumber('')
      setLocation('')
      setOrderItems([])
      setOrderNotes('')
      setSearchTerm('')
    }
  }, [open])

  const fetchAvailableTables = async () => {
    try {
      const response = await apiClient.get<Table[]>(TABLE_ENDPOINTS.tables)
      // Filter only available tables
      const availableTables = (response || []).filter(t => t.status === 'AVAILABLE')
      setTables(availableTables)
    } catch (error) {
      toast.error('فشل تحميل الطاولات المتاحة')
      console.error('Failed to fetch tables:', error)
    }
  }

  const fetchMenuData = async () => {
    try {
      setLoadingMenu(true)
      const [sectionsData, itemsData] = await Promise.all([
        apiClient.get<MenuSection[]>(MENU_ENDPOINTS.sections),
        apiClient.get<MenuItem[]>(MENU_ENDPOINTS.items),
      ])

      setSections(sectionsData || [])
      setMenuItems(itemsData || [])
    } catch (error) {
      toast.error('فشل تحميل قائمة الأصناف')
      console.error('Failed to fetch menu:', error)
    } finally {
      setLoadingMenu(false)
    }
  }

  // Filter menu items by search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [menuItems, searchTerm])

  // Group filtered items by section
  const itemsBySection = useMemo(() => {
    const grouped: { [key: number]: MenuItem[] } = {}
    filteredItems.forEach(item => {
      if (!grouped[item.section_id]) {
        grouped[item.section_id] = []
      }
      grouped[item.section_id].push(item)
    })
    return grouped
  }, [filteredItems])

  // Calculate totals
  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, orderItem) => {
      const itemPrice = parseFloat(orderItem.item.price)
      return sum + itemPrice * orderItem.quantity
    }, 0)
  }, [orderItems])

  const totalItems = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [orderItems])

  // Get quantity of specific item in order
  const getItemQuantity = (itemId: number): number => {
    const orderItem = orderItems.find(oi => oi.item.id === itemId)
    return orderItem?.quantity || 0
  }

  const handleAddItem = (item: MenuItem) => {
    const existingIndex = orderItems.findIndex(oi => oi.item.id === item.id)

    if (existingIndex >= 0) {
      const newItems = [...orderItems]
      newItems[existingIndex].quantity += 1
      setOrderItems(newItems)
    } else {
      setOrderItems([
        ...orderItems,
        {
          item,
          quantity: 1,
          notes: '',
        },
      ])
    }
  }

  const handleRemoveItem = (itemId: number) => {
    const existingIndex = orderItems.findIndex(oi => oi.item.id === itemId)
    if (existingIndex < 0) return

    const newItems = [...orderItems]
    if (newItems[existingIndex].quantity > 1) {
      newItems[existingIndex].quantity -= 1
    } else {
      newItems.splice(existingIndex, 1)
    }
    setOrderItems(newItems)
  }

  const handleDeleteItem = (itemId: number) => {
    setOrderItems(orderItems.filter(oi => oi.item.id !== itemId))
  }

  const validateForm = (): boolean => {
    if (orderItems.length === 0) {
      toast.error('الرجاء إضافة صنف واحد على الأقل')
      return false
    }

    if (orderType === 'dine-in') {
      if (!selectedTableId) {
        toast.error('الرجاء اختيار طاولة')
        return false
      }
    } else {
      if (!phoneNumber.trim()) {
        toast.error('رقم الهاتف مطلوب للتوصيل')
        return false
      }
      if (!location.trim()) {
        toast.error('العنوان مطلوب للتوصيل')
        return false
      }
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
      const createDto: CreateReceiptDto = {
        is_delivery: orderType === 'delivery',
        items: orderItems.map(oi => ({
          item_id: oi.item.id,
          quantity: oi.quantity,
          notes: oi.notes || undefined,
        })),
        notes: orderNotes || undefined,
      }

      if (orderType === 'dine-in') {
        createDto.table_id = parseInt(selectedTableId)
      } else {
        createDto.phone_number = phoneNumber
        createDto.location = location
      }

      await apiClient.post(ORDER_ENDPOINTS.receipts, createDto)

      toast.success('تم إنشاء الطلب بنجاح')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'فشل إنشاء الطلب'
      toast.error(message)
      console.error('Failed to create order:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-none h-[95vh] flex flex-col p-0 text-right">
        <DialogHeader className="px-6 pt-6 pb-4 text-right">
          <DialogTitle className="text-right">طلب جديد</DialogTitle>
          <DialogDescription className="text-right">
            اختر نوع الطلب وأضف الأصناف مباشرة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Left Panel: Menu Items */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Order Type Tabs */}
                <Tabs
                  value={orderType}
                  onValueChange={(value) =>
                    setOrderType(value as 'dine-in' | 'delivery')
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dine-in">طلب محلي</TabsTrigger>
                    <TabsTrigger value="delivery">طلب توصيل</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dine-in" className="mt-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">اختر الطاولة</Label>
                      {tables.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد طاولات متاحة
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {tables.map(table => (
                            <Card
                              key={table.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedTableId === table.id.toString()
                                  ? 'ring-2 ring-primary shadow-md'
                                  : ''
                              }`}
                              onClick={() => setSelectedTableId(table.id.toString())}
                            >
                              <div className="p-4 flex flex-col items-center justify-center gap-2">
                                <IconTable className="h-8 w-8 text-primary" />
                                <div className="text-xl font-bold">رقم {table.number}</div>
                                <TableStatusBadge status={table.status} />
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="delivery" className="mt-4 space-y-3">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="رقم الهاتف (05xxxxxxxx)"
                      disabled={loading}
                      dir="rtl"
                      className="text-right"
                    />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="العنوان"
                      disabled={loading}
                      dir="rtl"
                      className="text-right"
                    />
                  </TabsContent>
                </Tabs>

                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن صنف..."
                    className="pr-10 text-right"
                    dir="rtl"
                  />
                </div>

                {/* Menu Items by Section */}
                <ScrollArea className="flex-1 -mx-4 px-4">
                  <div className="space-y-6 pb-4">
                    {loadingMenu ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">جاري التحميل...</p>
                      </div>
                    ) : sections.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">لا توجد أصناف متاحة</p>
                      </div>
                    ) : (
                      sections.map(section => {
                        const sectionItems = itemsBySection[section.id] || []
                        if (sectionItems.length === 0) return null

                        return (
                          <div key={section.id}>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              {section.name}
                              <Badge variant="secondary">{sectionItems.length}</Badge>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {sectionItems.map(item => {
                                const quantity = getItemQuantity(item.id)
                                return (
                                  <Card
                                    key={item.id}
                                    className="p-3 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex gap-3">
                                      {item.image_path && (
                                        <img
                                          src={item.image_path}
                                          alt={item.name}
                                          className="w-16 h-16 rounded object-cover shrink-0"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">
                                          {item.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                          {item.description || ''}
                                        </p>
                                        <p className="text-sm font-semibold mt-1">
                                          {formatCurrency(item.price)}
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-center justify-center gap-1">
                                        {quantity > 0 ? (
                                          <>
                                            <Button
                                              type="button"
                                              size="icon"
                                              variant="outline"
                                              className="h-7 w-7"
                                              onClick={() => handleAddItem(item)}
                                            >
                                              <IconPlus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm font-semibold w-7 text-center">
                                              {quantity}
                                            </span>
                                            <Button
                                              type="button"
                                              size="icon"
                                              variant="outline"
                                              className="h-7 w-7"
                                              onClick={() => handleRemoveItem(item.id)}
                                            >
                                              <IconMinus className="h-3 w-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleAddItem(item)}
                                          >
                                            <IconPlus className="h-3 w-3" />
                                            إضافة
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel: Order Summary */}
              <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-r pt-4 lg:pt-0 lg:pr-4">
                <div className="sticky top-0">
                  <h3 className="font-semibold mb-3">
                    ملخص الطلب ({totalItems} صنف)
                  </h3>

                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      لم يتم إضافة أصناف بعد
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="max-h-[40vh] -mx-2 px-2">
                        <div className="space-y-2">
                          {orderItems.map((orderItem, index) => (
                            <div
                              key={`${orderItem.item.id}-${index}`}
                              className="border rounded-lg p-2 text-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {orderItem.item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {orderItem.quantity} × {formatCurrency(orderItem.item.price)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium whitespace-nowrap">
                                    {formatCurrency(
                                      parseFloat(orderItem.item.price) * orderItem.quantity
                                    )}
                                  </span>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => handleDeleteItem(orderItem.item.id)}
                                  >
                                    <IconTrash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-lg font-semibold">
                          <span>المجموع:</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <Label htmlFor="order-notes" className="text-xs">
                          ملاحظات الطلب (اختياري)
                        </Label>
                        <textarea
                          id="order-notes"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="ملاحظات..."
                          className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background mt-1 text-right"
                          disabled={loading}
                          maxLength={500}
                          dir="rtl"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading || orderItems.length === 0}
                className="flex-1"
              >
                {loading ? 'جاري الإنشاء...' : `إنشاء الطلب (${formatCurrency(subtotal)})`}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
