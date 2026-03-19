import 'server-only';

import { db } from '../db';
import { customers } from '../schema';
import { eq, asc, like, or, and, sql } from 'drizzle-orm';
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapCustomer(c: typeof customers.$inferSelect): Customer {
    return {
        ...c,
        website: c.website ?? null,
        industry: c.industry ?? null,
        created_at: c.created_at?.toISOString() ?? new Date().toISOString(),
        updated_at: c.updated_at?.toISOString() ?? new Date().toISOString(),
    };
}

const withCountsSelect = (userId: string) => ({
    id: customers.id,
    user_id: customers.user_id,
    name: customers.name,
    address: customers.address,
    website: customers.website,
    industry: customers.industry,
    notes: customers.notes,
    created_at: customers.created_at,
    updated_at: customers.updated_at,
    contact_count: sql<number>`(SELECT COUNT(*)::int FROM contacts WHERE contacts.customer_id = ${customers.id})`,
    quote_count: sql<number>`(SELECT COUNT(*)::int FROM quotes WHERE quotes.customer_name = ${customers.name} AND quotes.user_id = ${userId})`,
    order_count: sql<number>`(SELECT COUNT(*)::int FROM orders WHERE orders.customer_name = ${customers.name} AND orders.user_id = ${userId})`,
});

function mapCustomerWithCounts(r: {
    id: number; user_id: string | null; name: string; address: string | null;
    website: string | null; industry: string | null; notes: string | null;
    created_at: Date | null; updated_at: Date | null;
    contact_count: number; quote_count: number; order_count: number;
}): Customer {
    return {
        ...mapCustomer(r),
        contact_count: Number(r.contact_count),
        quote_count: Number(r.quote_count),
        order_count: Number(r.order_count),
    };
}

export async function getAllCustomers(): Promise<Customer[]> {
    const userId = await requireUserId();

    const result = await db.select(withCountsSelect(userId))
        .from(customers)
        .where(eq(customers.user_id, userId))
        .orderBy(asc(customers.name));
    return result.map(mapCustomerWithCounts);
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
        address: input.address,
        website: input.website,
        industry: input.industry,
        notes: input.notes,
    }).returning();

    return mapCustomer(result[0]);
}

export async function updateCustomer(id: number, input: UpdateCustomerInput): Promise<Customer | undefined> {
    const userId = await requireUserId();

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

    const result = await db.select(withCountsSelect(userId))
        .from(customers)
        .where(and(
            eq(customers.user_id, userId),
            or(
                like(customers.name, searchTerm),
                like(customers.industry, searchTerm),
                like(customers.address, searchTerm),
            )
        ))
        .orderBy(asc(customers.name));

    return result.map(mapCustomerWithCounts);
}
