"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"
import { MENU_ENDPOINTS } from "@/lib/api/endpoints"

interface Section {
  id: number
  name: string
}

interface Item {
  id: number
  name: string
  price: string
  sectionId: number
  imageId: number | null
  description: string | null
  image: { id: number; path: string } | null
}

interface ItemFormProps {
  item?: Item | null
  sectionId?: number
  sections: Section[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ItemForm({
  item,
  sectionId,
  sections,
  open,
  onOpenChange,
  onSuccess,
}: ItemFormProps) {
  const isMobile = useIsMobile()
  const [name, setName] = useState("")
  const [selectedSectionId, setSelectedSectionId] = useState<string>("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset form when item changes or dialog opens
  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name)
        setSelectedSectionId(item.sectionId.toString())
        setPrice(item.price)
        setDescription(item.description || "")
        setImagePreview(item.image?.path || null)
        setUploadedImageId(item.imageId)
      } else {
        setName("")
        setSelectedSectionId(sectionId?.toString() || "")
        setPrice("")
        setDescription("")
        setImagePreview(null)
        setUploadedImageId(null)
      }
      setImageFile(null)
    }
  }, [item, sectionId, open])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload image immediately
    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch("/api/images", {
        method: "POST",
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "فشل رفع الصورة")
      }

      setUploadedImageId(data.data.id)
      toast.success("تم رفع الصورة بنجاح")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل رفع الصورة")
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("اسم المنتج مطلوب")
      return
    }

    if (!selectedSectionId) {
      toast.error("القسم مطلوب")
      return
    }

    if (!price || isNaN(parseFloat(price))) {
      toast.error("السعر غير صحيح")
      return
    }

    setLoading(true)

    try {
      const body: any = {
        name: name.trim(),
        section_id: parseInt(selectedSectionId),
        price: parseFloat(price).toFixed(2),
        description: description.trim() || null,
        image_id: uploadedImageId,
      }

      if (item) {
        await apiClient.patch(MENU_ENDPOINTS.itemById(item.id), body)
      } else {
        await apiClient.post(MENU_ENDPOINTS.items, body)
      }

      toast.success(
        item ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح"
      )
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "left"}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {item ? "تعديل المنتج" : "إضافة منتج جديد"}
          </DrawerTitle>
          <DrawerDescription>
            {item ? "قم بتحديث معلومات المنتج" : "أضف منتجاً جديداً للقائمة"}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="item-name">اسم المنتج *</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: بيتزا مارجريتا"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-section">القسم *</Label>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
                disabled={loading || !!sectionId}
              >
                <SelectTrigger id="item-section">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-price">السعر (د.ع) *</Label>
              <Input
                id="item-price"
                type="text"
                inputMode="decimal"
                pattern="^\d+(\.\d{1,2})?$"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 25.50"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-image">صورة المنتج</Label>
              <Input
                id="item-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="معاينة"
                    className="w-32 h-32 rounded object-cover border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">الوصف</Label>
              <textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المنتج (اختياري)..."
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? "جاري الحفظ..."
                : item
                  ? "حفظ التعديلات"
                  : "إضافة المنتج"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading}>
                إلغاء
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
