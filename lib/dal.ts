/**
 * ⚠️ DEPRECATED - Phase 0 Migration
 *
 * Data Access Layer for server-side authentication.
 * With the migration to external backend API, this DAL is NO LONGER USED.
 *
 * Old architecture: Next.js API Routes → DAL → Prisma → PostgreSQL
 * New architecture: Next.js Client → External API (192.168.100.75:5000) → Backend DB
 *
 * This file will be REMOVED in Phase 1.
 * DO NOT use these functions in new code.
 *
 * For authentication in the frontend, use:
 * - /lib/contexts/auth-context.tsx (auth state management)
 * - /lib/api/client.ts (API calls to external backend)
 * - /hooks/use-auth.ts (auth hook)
 */

import 'server-only';
import { cookies, headers } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';
import { cache } from 'react';

/**
 * CRITICAL: Data Access Layer (DAL)
 *
 * This is the security layer that MUST be used for all data access.
 * Never rely solely on proxy.ts for authentication.
 *
 * According to Next.js 16 best practices, every data access point
 * must verify authentication independently.
 */

export const verifySession = cache(async () => {
  // Try to get token from Authorization header first (new auth system)
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie (old auth system)
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('auth-token')?.value;
  }

  if (!token) {
    return { isAuth: false, userId: null, role: null };
  }

  try {
    const payload = await verifyToken(token);
    return {
      isAuth: true,
      userId: payload.userId,
      role: payload.role,
    };
  } catch (error) {
    return { isAuth: false, userId: null, role: null };
  }
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session.isAuth || !session.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.userId) },
    select: {
      id: true,
      fullname: true,
      username: true,
      is_active: true,
    },
  });

  return user;
});

export const requireAuth = async () => {
  const session = await verifySession();
  if (!session.isAuth || !session.userId) {
    throw new Error('Unauthorized');
  }
  return { ...session, userId: session.userId as string };
};

export const requireRole = async (allowedRoles: string[]) => {
  const session = await requireAuth();
  if (!session.role || !allowedRoles.includes(session.role)) {
    throw new Error('Forbidden');
  }
  return session;
};
