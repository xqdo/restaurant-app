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

interface Section {
  id: number
  name: string
}

interface SectionFormProps {
  section?: Section | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SectionForm({
  section,
  open,
  onOpenChange,
  onSuccess,
}: SectionFormProps) {
  const isMobile = useIsMobile()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  // Reset form when section changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(section?.name || "")
    }
  }, [section, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("اسم القسم مطلوب")
      return
    }

    setLoading(true)

    try {
      const url = section
        ? `/api/sections/${section.id}`
        : "/api/sections"
      const method = section ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "فشلت العملية")
      }

      toast.success(
        section ? "تم تحديث القسم بنجاح" : "تم إضافة القسم بنجاح"
      )
      onSuccess()
      onOpenChange(false)
      setName("")
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
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {section ? "تعديل القسم" : "إضافة قسم جديد"}
          </DrawerTitle>
          <DrawerDescription>
            {section
              ? "قم بتحديث اسم القسم"
              : "أضف قسماً جديداً لتنظيم المنتجات"}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-name">اسم القسم</Label>
              <Input
                id="section-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: المشروبات، الوجبات الرئيسية..."
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? "جاري الحفظ..."
                : section
                  ? "حفظ التعديلات"
                  : "إضافة القسم"}
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
