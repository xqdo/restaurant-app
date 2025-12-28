"use client"

import { useState } from "react"
import { IconChevronDown, IconDotsVertical, IconPlus } from "@tabler/icons-react"
import { ItemsTable } from "@/components/items-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Section {
  id: number
  name: string
  itemCount: number
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
}

interface SectionAccordionProps {
  section: Section
  items: Item[]
  onEdit: (section: Section) => void
  onDelete: (sectionId: number) => void
  onAddItem: (sectionId: number) => void
  onEditItem: (item: Item) => void
  onDeleteItem: (itemId: number) => void
}

export function SectionAccordion({
  section,
  items,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted/50">
          <div className="flex items-center gap-3 flex-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "transform rotate-180" : ""
                  }`}
                />
                <span className="sr-only">تبديل</span>
              </Button>
            </CollapsibleTrigger>

            <h3 className="text-lg font-semibold">{section.name}</h3>

            <Badge variant="secondary" className="mr-2">
              {items.length} منتج
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 data-[state=open]:bg-muted"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(section)}>
                تعديل القسم
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(section.id)}
              >
                حذف القسم
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => onAddItem(section.id)} size="sm">
                <IconPlus className="h-4 w-4" />
                إضافة منتج
              </Button>
            </div>

            <ItemsTable
              items={items}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
