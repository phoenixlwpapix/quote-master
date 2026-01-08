import 'server-only';

import { neonAuth } from '@neondatabase/auth/next/server';
import { cache } from 'react';

/**
 * Get the current authenticated user from the session.
 * This is cached per-request for optimal performance.
 * Returns null if not authenticated.
 */
export const getCurrentUser = cache(async () => {
    const { user, session } = await neonAuth();

    if (!user || !session) {
        return null;
    }

    return user;
});

/**
 * Get the current user ID or throw an error if not authenticated.
 * Use this in server actions and API routes that require authentication.
 */
export async function requireUserId(): Promise<string> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    return user.id;
}

/**
 * Get the current user ID, or return undefined if not authenticated.
 * Use this when you need to optionally filter by user.
 */
export async function getUserIdOrUndefined(): Promise<string | undefined> {
    const user = await getCurrentUser();
    return user?.id;
}
