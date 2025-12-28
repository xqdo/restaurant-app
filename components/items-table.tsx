"use client"

import { IconDotsVertical } from "@tabler/icons-react"
import { formatPrice } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

interface ItemsTableProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (itemId: number) => void
}

export function ItemsTable({ items, onEdit, onDelete }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>لا توجد منتجات في هذا القسم</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">صورة</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead className="w-32">السعر</TableHead>
            <TableHead className="w-20 text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.image ? (
                  <img
                    src={item.image.path}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                    لا صورة
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{formatPrice(item.price)}</TableCell>
              <TableCell className="text-center">
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
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
