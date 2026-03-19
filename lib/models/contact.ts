import 'server-only';

import { db } from '../db';
import { contacts } from '../schema';
import { eq, asc, and } from 'drizzle-orm';
import type { Contact, CreateContactInput, UpdateContactInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapContact(c: typeof contacts.$inferSelect): Contact {
    return {
        ...c,
        created_at: c.created_at?.toISOString() ?? new Date().toISOString(),
        updated_at: c.updated_at?.toISOString() ?? new Date().toISOString(),
    };
}

export async function getContactsByCustomerId(customerId: number): Promise<Contact[]> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(contacts)
        .where(and(eq(contacts.customer_id, customerId), eq(contacts.user_id, userId)))
        .orderBy(asc(contacts.is_primary), asc(contacts.name));
    // is_primary desc: false < true in asc, so primary comes last — use desc trick
    return result
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map(mapContact);
}

export async function createContact(customerId: number, input: CreateContactInput): Promise<Contact> {
    const userId = await requireUserId();

    const result = await db.insert(contacts).values({
        customer_id: customerId,
        user_id: userId,
        name: input.name,
        title: input.title,
        email: input.email,
        phone: input.phone,
        is_primary: input.is_primary ?? false,
        notes: input.notes,
    }).returning();

    return mapContact(result[0]);
}

export async function updateContact(id: number, input: UpdateContactInput): Promise<Contact | undefined> {
    const userId = await requireUserId();

    const result = await db.update(contacts).set({
        ...input,
        updated_at: new Date(),
    })
        .where(and(eq(contacts.id, id), eq(contacts.user_id, userId)))
        .returning();

    if (result.length === 0) return undefined;
    return mapContact(result[0]);
}

export async function deleteContact(id: number): Promise<boolean> {
    const userId = await requireUserId();

    const result = await db.delete(contacts)
        .where(and(eq(contacts.id, id), eq(contacts.user_id, userId)))
        .returning({ id: contacts.id });
    return result.length > 0;
}
