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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'
import type { RegisterDto } from '@/lib/types/auth.types'

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ROLES = [
  { id: 1, name: 'Admin', label: 'مدير النظام' },
  { id: 2, name: 'Manager', label: 'مدير' },
  { id: 3, name: 'Waiter', label: 'نادل' },
  { id: 4, name: 'Kitchen', label: 'مطبخ' },
  { id: 5, name: 'Cashier', label: 'أمين الصندوق' },
  { id: 6, name: 'Delivery', label: 'توصيل' },
]

export function UserForm({ open, onOpenChange, onSuccess }: UserFormProps) {
  const isMobile = useIsMobile()
  const [fullname, setFullname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFullname('')
      setUsername('')
      setPassword('')
      setSelectedRoles([])
      setIsActive(true)
    }
  }, [open])

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!fullname.trim()) {
      toast.error('الاسم الكامل مطلوب')
      return
    }

    if (!username.trim()) {
      toast.error('اسم المستخدم مطلوب')
      return
    }

    if (!password || password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (selectedRoles.length === 0) {
      toast.error('يجب اختيار دور واحد على الأقل')
      return
    }

    setLoading(true)

    try {
      const registerDto: RegisterDto = {
        fullname: fullname.trim(),
        username: username.trim(),
        password,
        role_ids: selectedRoles,
        is_active: isActive,
      }

      await apiClient.post(AUTH_ENDPOINTS.register, registerDto)

      toast.success('تم إنشاء المستخدم بنجاح')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      let errorMessage = 'حدث خطأ أثناء إنشاء المستخدم'

      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('409')) {
          errorMessage = 'اسم المستخدم موجود بالفعل'
        } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
          errorMessage = 'غير مصرح لك بإنشاء المستخدمين (مطلوب دور المدير)'
        } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'غير مصرح لك بإنشاء المستخدمين (مطلوب دور المدير)'
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
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
          <DrawerTitle>إضافة مستخدم جديد</DrawerTitle>
          <DrawerDescription>
            أنشئ حساب مستخدم جديد وحدد الأدوار المناسبة
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullname">الاسم الكامل *</Label>
              <Input
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="أحمد محمد"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ahmed_waiter"
                required
                disabled={loading}
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">
                أحرف وأرقام فقط، بدون مسافات
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">
                6 أحرف على الأقل
              </p>
            </div>

            {/* Roles */}
            <div className="space-y-3">
              <Label>الأدوار *</Label>
              <div className="space-y-2">
                {ROLES.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                اختر دوراً واحداً على الأقل
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between space-x-2 space-x-reverse">
              <Label htmlFor="is-active" className="cursor-pointer">
                حساب نشط
              </Label>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
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
