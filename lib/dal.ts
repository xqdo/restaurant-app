import 'server-only';
import { cookies } from 'next/headers';
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
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

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
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      avatar: true,
    },
  });

  return user;
});

export const requireAuth = async () => {
  const session = await verifySession();
  if (!session.isAuth) {
    throw new Error('Unauthorized');
  }
  return session;
};

export const requireRole = async (allowedRoles: string[]) => {
  const session = await requireAuth();
  if (!session.role || !allowedRoles.includes(session.role)) {
    throw new Error('Forbidden');
  }
  return session;
};
