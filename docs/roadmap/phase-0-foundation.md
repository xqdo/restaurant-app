# Phase 0: Authentication & Users (Complete Feature)

**Timeline:** Week 1 | **Priority:** 🎯 CRITICAL

## Objective

Build **complete authentication system** from database to UI. This is the foundation - all other phases depend on it. Users can log in, admins can manage users, all routes are protected.

## What Gets Built (Full Stack)

### 1. Service Layer
```typescript
// /lib/services/auth.service.ts
✅ login(username, password)
✅ register(data, adminUserId)
✅ getProfile(userId)

// /lib/services/user.service.ts
✅ createUser(data, createdBy)
✅ getAllUsers()
✅ getUserById(id)
✅ updateUser(id, data, updatedBy)
✅ deleteUser(id, deletedBy)
✅ assignRoles(userId, roleIds)
```

### 2. Middleware
```typescript
// /lib/middleware/auth.middleware.ts
✅ getCurrentUser(request)
✅ requireAuth()
✅ requireRoles(roles[])
```

### 3. API Routes
```typescript
✅ POST /api/auth/login - Login and get JWT
✅ POST /api/auth/register - Create user (Admin only)
✅ GET /api/auth/me - Get current user profile
✅ GET /api/users - List all users
✅ POST /api/users - Create user
✅ GET /api/users/{id} - Get user details
✅ PATCH /api/users/{id} - Update user
✅ DELETE /api/users/{id} - Soft delete user
```

### 4. UI Pages & Components
```typescript
✅ /app/login/page.tsx - Login page (NEW PAGE)
✅ /app/users/page.tsx - User management (replace UnderDevelopment)
✅ /components/login-form.tsx - Login form
✅ /components/user-form.tsx - Create/edit user form
✅ /components/user-table.tsx - Users list table
✅ /components/role-badge.tsx - Role display badges
```

### 5. Features
- ✅ Login with username/password
- ✅ JWT token with HTTP-only cookies
- ✅ Session management (24-hour expiration)
- ✅ User CRUD (Admin only)
- ✅ Role assignment (6 roles)
- ✅ Protected routes (all pages require auth)
- ✅ Role-based access control (RBAC)

## Implementation Steps

### Step 1: Authentication Utilities (REUSE EXISTING)
Files already exist at `/lib/auth.ts`:
- ✅ `createToken()` - Generate JWT
- ✅ `verifyToken()` - Validate JWT
- ✅ `hashPassword()` - Hash with bcrypt
- ✅ `comparePassword()` - Verify password
- ✅ `setTokenCookie()` - Set HTTP-only cookie
- ✅ `getTokenFromCookie()` - Extract token

**Action:** Review and use these functions

### Step 2: Auth Service Layer (1 hour)
Create `/lib/services/auth.service.ts`:
- login() - Verify credentials, create token
- register() - Create user with roles
- getProfile() - Get user with roles
- Use existing auth utilities

### Step 3: User Service Layer (1 hour)
Create `/lib/services/user.service.ts`:
- CRUD operations
- Role assignment
- Soft delete
- Follow item.service.ts pattern

### Step 4: Middleware (1 hour)
Create `/lib/middleware/auth.middleware.ts`:
- Extract and verify token
- Get current user from token
- Check roles for authorization
- Use in all API routes

### Step 5: API Routes (2 hours)
Create auth and user API routes:
- Auth routes (login, register, me)
- User routes (full CRUD)
- Add auth middleware to all routes
- Only Admin can manage users

### Step 6: Login Page UI (1-2 hours)
Create `/app/login/page.tsx`:
- Username and password inputs
- Form validation
- Call login API
- Store token in cookie
- Redirect to dashboard
- Show errors with toast

### Step 7: User Management UI (2-3 hours)
Edit `/app/users/page.tsx`:
- List all users in table
- Show roles as badges
- Create/edit user form (drawer)
- Delete confirmation
- Only Admin can access
- Filter and search

### Step 8: Route Protection (1 hour)
Add middleware to protect routes:
- Check token on all pages
- Redirect to /login if no token
- Verify role requirements
- Handle token expiration

### Step 9: Testing (1 hour)
- Test login flow
- Test user CRUD
- Test role assignment
- Test route protection
- Test different roles
- Test token expiration

## Six User Roles

| ID | Role | Access Level |
|----|------|-------------|
| 1 | Admin | Full system access, user management |
| 2 | Manager | Operations, reporting, menu management |
| 3 | Waiter | Order taking, table management |
| 4 | Kitchen | Kitchen display, order preparation |
| 5 | Cashier | Payment processing, discounts |
| 6 | Delivery | Delivery management, driver operations |

## JWT Token Structure

```typescript
{
  userId: number,
  username: string,
  roles: string[],  // ["Admin", "Manager"]
  iat: number,      // Issued at timestamp
  exp: number       // Expiration (24 hours)
}
```

## Database Schema (Already Exists)

```prisma
model User {
  id            Int       @id
  fullname      String
  username      String    @unique
  password      String
  is_active     Boolean   @default(true)
  isdeleted     Boolean   @default(false)
  BaseEntity    BaseEntity  @relation(...)
  UserRole      UserRole[]
  Log           Log[]
}

model Role {
  id        Int       @id
  name      String
  UserRole  UserRole[]
}

model UserRole {
  user_id   Int
  role_id   Int
  User      User  @relation(...)
  Role      Role  @relation(...)
}
```

## Acceptance Criteria (Done When...)

- [ ] All 8 API endpoints working
- [ ] `/app/login/page.tsx` allows login (NEW PAGE)
- [ ] `/app/users/page.tsx` shows users (no UnderDevelopment)
- [ ] Can log in with valid credentials
- [ ] Invalid credentials rejected
- [ ] JWT token stored in HTTP-only cookie
- [ ] Token expires after 24 hours
- [ ] Admins can create users
- [ ] Admins can assign roles
- [ ] Admins can list/edit/delete users
- [ ] Non-admins cannot access user management
- [ ] All routes require authentication
- [ ] Role-based access enforced
- [ ] Passwords hashed with bcrypt
- [ ] Audit trail tracks all user actions
- [ ] Toast notifications work
- [ ] Works on mobile
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/auth.service.ts
- /lib/services/user.service.ts
- /lib/middleware/auth.middleware.ts
- /app/api/auth/login/route.ts
- /app/api/auth/register/route.ts
- /app/api/auth/me/route.ts
- /app/api/users/route.ts
- /app/api/users/[id]/route.ts
- /app/login/page.tsx (NEW PAGE)
- /components/login-form.tsx
- /components/user-form.tsx
- /components/user-table.tsx
- /components/role-badge.tsx

MODIFIED FILES:
- /app/users/page.tsx (replace UnderDevelopment)
- All existing API routes (add auth middleware)

EXISTING (REUSE):
- /lib/auth.ts (authentication utilities)
```

## Seed Data Required

```typescript
// Ensure 6 roles exist
await prisma.role.createMany({
  data: [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Waiter' },
    { id: 4, name: 'Kitchen' },
    { id: 5, name: 'Cashier' },
    { id: 6, name: 'Delivery' }
  ],
  skipDuplicates: true
})

// Create initial admin user
const hashedPassword = await hashPassword('Admin@123')
await prisma.user.create({
  data: {
    fullname: 'System Administrator',
    username: 'admin',
    password: hashedPassword,
    is_active: true,
    UserRole: {
      create: [{ role_id: 1 }]
    }
  }
})
```

## Environment Variables

```bash
# .env
JWT_SECRET=your-secret-key-here-change-in-production
DATABASE_URL=postgresql://...
```

## Next Phase

After authentication is complete, move to **Phase 1: Tables** where we'll build the table management system (all tables require auth from this phase).

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
