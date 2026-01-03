"use client"

import { useEffect, useState } from "react"
import { IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { ItemForm } from "@/components/item-form"
import { SectionAccordion } from "@/components/section-accordion"
import { SectionForm } from "@/components/section-form"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"
import { MENU_ENDPOINTS } from "@/lib/api/endpoints"

interface Section {
  id: number
  name: string
  itemCount?: number
  createdAt?: string
  updatedAt?: string | null
}

interface Item {
  id: number
  name: string
  price: string
  sectionId: number
  imageId: number | null
  description: string | null
  section: { id: number; name: string }
  image: { id: number; path: string } | null
  createdAt?: string
  updatedAt?: string | null
}

// Backend returns snake_case, transform to camelCase
interface BackendItem {
  id: number
  name: string
  price: string
  section_id: number
  image_id: number | null
  description: string | null
  section: { id: number; name: string }
  image: { id: number; path: string } | null
  baseEntity?: any
}

function transformItem(backendItem: BackendItem): Item {
  return {
    id: backendItem.id,
    name: backendItem.name,
    price: backendItem.price,
    sectionId: backendItem.section_id,
    imageId: backendItem.image_id,
    description: backendItem.description,
    section: backendItem.section,
    image: backendItem.image,
    createdAt: backendItem.baseEntity?.created_at,
    updatedAt: backendItem.baseEntity?.updated_at,
  }
}

export default function ItemsPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager']}>
      <ItemsPageContent />
    </AuthGuard>
  )
}

function ItemsPageContent() {
  const [sections, setSections] = useState<Section[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // Form dialog states
  const [sectionFormOpen, setSectionFormOpen] = useState(false)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>()

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sectionsData, itemsData] = await Promise.all([
        apiClient.get<Section[]>(MENU_ENDPOINTS.sections),
        apiClient.get<BackendItem[]>(MENU_ENDPOINTS.items),
      ])

      setSections(sectionsData || [])
      setItems((itemsData || []).map(transformItem))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  // Get items for a specific section
  const getItemsBySection = (sectionId: number): Item[] => {
    return items.filter((item) => item.sectionId === sectionId)
  }

  // Section handlers
  const handleAddSection = () => {
    setEditingSection(null)
    setSectionFormOpen(true)
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setSectionFormOpen(true)
  }

  const handleDeleteSection = async (sectionId: number) => {
    const sectionItems = getItemsBySection(sectionId)

    if (sectionItems.length > 0) {
      toast.error(
        `لا يمكن حذف القسم. يحتوي على ${sectionItems.length} منتج. يرجى حذف المنتجات أولاً.`
      )
      return
    }

    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      return
    }

    try {
      await apiClient.delete(MENU_ENDPOINTS.sectionById(sectionId))
      toast.success("تم حذف القسم بنجاح")
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حذف القسم")
    }
  }

  // Item handlers
  const handleAddItem = (sectionId: number) => {
    setEditingItem(null)
    setSelectedSectionId(sectionId)
    setItemFormOpen(true)
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setSelectedSectionId(undefined)
    setItemFormOpen(true)
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      return
    }

    try {
      await apiClient.delete(MENU_ENDPOINTS.itemById(itemId))
      toast.success("تم حذف المنتج بنجاح")
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حذف المنتج")
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">الأصناف</h1>
              <p className="text-muted-foreground mt-1">
                إدارة الأقسام والمنتجات
              </p>
            </div>
            <Button onClick={handleAddSection}>
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة قسم</span>
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          )}

          {/* Empty State */}
          {!loading && sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">لا توجد أقسام</h3>
                <p className="text-muted-foreground max-w-sm">
                  ابدأ بإضافة قسم جديد لتنظيم منتجاتك. يمكنك إضافة أقسام مثل
                  المشروبات، الوجبات الرئيسية، الحلويات، وغيرها.
                </p>
                <Button onClick={handleAddSection} className="mt-4">
                  <IconPlus className="h-4 w-4" />
                  إضافة أول قسم
                </Button>
              </div>
            </div>
          )}

          {/* Sections Accordion */}
          {!loading && sections.length > 0 && (
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionAccordion
                  key={section.id}
                  section={section}
                  items={getItemsBySection(section.id)}
                  onEdit={handleEditSection}
                  onDelete={handleDeleteSection}
                  onAddItem={() => handleAddItem(section.id)}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Forms */}
        <SectionForm
          section={editingSection}
          open={sectionFormOpen}
          onOpenChange={setSectionFormOpen}
          onSuccess={fetchData}
        />

        <ItemForm
          item={editingItem}
          sectionId={selectedSectionId}
          sections={sections}
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
          onSuccess={fetchData}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
