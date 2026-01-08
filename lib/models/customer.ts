import 'server-only';

import { db } from '../db';
import { customers } from '../schema';
import { eq, asc, like, or, and } from 'drizzle-orm';
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapCustomer(c: typeof customers.$inferSelect): Customer {
    return {
        ...c,
        created_at: c.created_at?.toISOString() ?? new Date().toISOString(),
        updated_at: c.updated_at?.toISOString() ?? new Date().toISOString(),
    };
}

export async function getAllCustomers(): Promise<Customer[]> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(customers)
        .where(eq(customers.user_id, userId))
        .orderBy(asc(customers.name));
    return result.map(mapCustomer);
}

export async function getCustomerById(id: number): Promise<Customer | undefined> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(customers)
        .where(and(eq(customers.id, id), eq(customers.user_id, userId)));
    if (result.length === 0) return undefined;
    return mapCustomer(result[0]);
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const userId = await requireUserId();

    const result = await db.insert(customers).values({
        user_id: userId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        company: input.company,
        notes: input.notes,
    }).returning();

    return mapCustomer(result[0]);
}

export async function updateCustomer(id: number, input: UpdateCustomerInput): Promise<Customer | undefined> {
    const userId = await requireUserId();

    // First verify ownership
    const existing = await getCustomerById(id);
    if (!existing) return undefined;

    const result = await db.update(customers).set({
        ...input,
        updated_at: new Date(),
    })
        .where(and(eq(customers.id, id), eq(customers.user_id, userId)))
        .returning();

    if (result.length === 0) return undefined;
    return mapCustomer(result[0]);
}

export async function deleteCustomer(id: number): Promise<boolean> {
    const userId = await requireUserId();

    const result = await db.delete(customers)
        .where(and(eq(customers.id, id), eq(customers.user_id, userId)))
        .returning({ id: customers.id });
    return result.length > 0;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
    const userId = await requireUserId();
    const searchTerm = `%${query}%`;

    const result = await db.select()
        .from(customers)
        .where(and(
            eq(customers.user_id, userId),
            or(
                like(customers.name, searchTerm),
                like(customers.email, searchTerm),
                like(customers.company, searchTerm),
                like(customers.phone, searchTerm)
            )
        ))
        .orderBy(asc(customers.name));

    return result.map(mapCustomer);
}
