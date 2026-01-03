/**
 * Item Selector Drawer Component
 * Browse and select menu items to add to an order
 */

'use client'

import { useEffect, useState } from 'react'
import { IconCheck, IconSearch } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { apiClient } from '@/lib/api/client'
import { MENU_ENDPOINTS } from '@/lib/api/endpoints'
import type { MenuItem, MenuSection } from '@/lib/types/menu.types'
import { formatCurrency } from '@/lib/utils/currency'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface ItemSelectorDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectItem: (item: MenuItem) => void
  selectedItemIds: number[]
}

export function ItemSelectorDrawer({
  open,
  onOpenChange,
  onSelectItem,
  selectedItemIds,
}: ItemSelectorDrawerProps) {
  const isMobile = useIsMobile()
  const [sections, setSections] = useState<MenuSection[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch menu data when drawer opens
  useEffect(() => {
    if (open) {
      fetchMenuData()
    }
  }, [open])

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      const [sectionsData, itemsData] = await Promise.all([
        apiClient.get<MenuSection[]>(MENU_ENDPOINTS.sections),
        apiClient.get<MenuItem[]>(MENU_ENDPOINTS.items),
      ])

      setSections(sectionsData || [])
      setItems(itemsData || [])
    } catch (error) {
      toast.error('فشل تحميل قائمة الأصناف')
      console.error('Failed to fetch menu:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group items by section
  const getItemsBySection = (sectionId: number): MenuItem[] => {
    return items.filter((item) => item.section_id === sectionId)
  }

  // Filter items by search term
  const filteredSections = sections.map((section) => {
    const sectionItems = getItemsBySection(section.id).filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return {
      section,
      items: sectionItems,
    }
  }).filter((group) => group.items.length > 0)

  const handleSelectItem = (item: MenuItem) => {
    onSelectItem(item)
  }

  const isItemSelected = (itemId: number) => {
    return selectedItemIds.includes(itemId)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'left'}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>اختر الأصناف</DrawerTitle>
          <DrawerDescription>
            اختر الأصناف لإضافتها إلى الطلب
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4">
          {/* Search Input */}
          <div className="relative">
            <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن صنف..."
              className="pr-10"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          )}

          {!loading && filteredSections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد أصناف متاحة'}
            </div>
          )}

          {!loading && filteredSections.length > 0 && (
            <Accordion type="multiple" className="space-y-2">
              {filteredSections.map(({ section, items: sectionItems }) => (
                <AccordionItem
                  key={section.id}
                  value={`section-${section.id}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full text-right">
                      <span className="font-semibold">{section.name}</span>
                      <span className="text-sm text-muted-foreground mr-2">
                        ({sectionItems.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {sectionItems.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Item Image */}
                            {item.image_path && (
                              <img
                                src={item.image_path}
                                alt={item.name}
                                className="w-16 h-16 rounded object-cover shrink-0"
                              />
                            )}

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                {isItemSelected(item.id) && (
                                  <div className="flex items-center gap-1 text-green-600 text-sm shrink-0">
                                    <IconCheck className="h-4 w-4" />
                                    <span>مضاف</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-semibold mt-2">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">إغلاق</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
