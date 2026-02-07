'use client'

import { useEffect, useState } from 'react'
import { IconPlus, IconSearch, IconDotsVertical } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api/client'
import { USER_ENDPOINTS } from '@/lib/api/endpoints'
import type { UserListItem } from '@/lib/types/auth.types'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { UserForm } from '@/components/user-form'
import { RoleBadge } from '@/components/role-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ROLE_NAMES = ['Admin', 'Manager', 'Waiter', 'Kitchen', 'Cashier', 'Delivery'] as const

const ROLE_LABELS_AR: Record<string, string> = {
  Admin: 'مدير النظام',
  Manager: 'مدير',
  Waiter: 'نادل',
  Kitchen: 'مطبخ',
  Cashier: 'أمين الصندوق',
  Delivery: 'توصيل',
}

export default function UsersPage() {
  return (
    <AuthGuard requiredRoles={['Admin']}>
      <UsersPageContent />
    </AuthGuard>
  )
}

function UsersPageContent() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<UserListItem[]>(USER_ENDPOINTS.users)
      setUsers(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.roles.includes(roleFilter)
    return matchesSearch && matchesRole
  })

  // Role counts for tabs
  const roleCounts: Record<string, number> = {
    ALL: users.length,
  }
  for (const role of ROLE_NAMES) {
    roleCounts[role] = users.filter((u) => u.roles.includes(role)).length
  }

  const handleAdd = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleEdit = (user: UserListItem) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleDeleteClick = (user: UserListItem) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      await apiClient.delete(USER_ENDPOINTS.byId(userToDelete.id))
      toast.success('تم حذف المستخدم')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف المستخدم')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
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
              <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
              <p className="text-muted-foreground mt-1">
                إدارة حسابات المستخدمين وأدوارهم وصلاحياتهم
              </p>
            </div>
            <Button onClick={handleAdd}>
              <IconPlus className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">إضافة مستخدم جديد</span>
              <span className="sm:hidden">إضافة</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو اسم المستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>

          {/* Role Filter Tabs */}
          <Tabs value={roleFilter} onValueChange={setRoleFilter}>
            <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
              <TabsTrigger value="ALL">الكل ({roleCounts.ALL})</TabsTrigger>
              {ROLE_NAMES.map((role) => (
                <TabsTrigger key={role} value={role}>
                  {ROLE_LABELS_AR[role]} ({roleCounts[role]})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Loading State */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-semibold">لا يوجد مستخدمين</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                {searchQuery || roleFilter !== 'ALL'
                  ? 'لا توجد نتائج تطابق البحث أو الفلتر المحدد'
                  : 'ابدأ بإضافة مستخدم جديد'}
              </p>
              {!searchQuery && roleFilter === 'ALL' && (
                <Button onClick={handleAdd} className="mt-4">
                  <IconPlus className="ml-2 h-4 w-4" />
                  إضافة أول مستخدم
                </Button>
              )}
            </div>
          )}

          {/* Users Table */}
          {!loading && filteredUsers.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم الكامل</TableHead>
                    <TableHead className="text-right">اسم المستخدم</TableHead>
                    <TableHead className="text-right">الأدوار</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      تاريخ الإنشاء
                    </TableHead>
                    <TableHead className="text-center w-12">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id

                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.fullname}
                          {isSelf && (
                            <span className="text-xs text-muted-foreground mr-2">
                              (أنت)
                            </span>
                          )}
                        </TableCell>
                        <TableCell dir="ltr" className="text-left font-mono text-sm">
                          {u.username}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.roles.map((role) => (
                              <RoleBadge key={role} role={role} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.is_active
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-400 hover:bg-gray-500 text-white'
                            }
                          >
                            {u.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString('ar-IQ')}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <IconDotsVertical className="h-4 w-4" />
                                <span className="sr-only">فتح القائمة</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(u)}>
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteClick(u)}
                                disabled={isSelf}
                              >
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* User Form Drawer (Create / Edit) */}
        <UserForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={fetchUsers}
          user={editingUser}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="text-right">
            <AlertDialogHeader className="text-right">
              <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من حذف المستخدم "{userToDelete?.fullname}"؟
                <br />
                لن يتمكن المستخدم من تسجيل الدخول بعد الحذف.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
