import 'server-only';

import { db } from '../db';
import { quotes, quoteItems } from '../schema';
import { eq, desc, like, sql, and } from 'drizzle-orm';
import type { Quote, QuoteItem, CreateQuoteInput, UpdateQuoteInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapQuote(row: typeof quotes.$inferSelect): Quote {
    return {
        ...row,
        created_at: row.created_at?.toISOString() ?? new Date().toISOString(),
        updated_at: row.updated_at?.toISOString() ?? new Date().toISOString(),
        valid_until: row.valid_until ?? null,
        status: row.status as Quote['status'],
        items: undefined, // Filled later
    };
}

function mapQuoteItem(row: typeof quoteItems.$inferSelect): QuoteItem {
    return {
        ...row,
        quote_id: row.quote_id ?? undefined,
        id: row.id,
    };
}

async function generateQuoteNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `Q-${year}-`;

    // Query only this user's quotes for per-user numbering
    const result = await db.select({ quote_number: quotes.quote_number })
        .from(quotes)
        .where(and(
            eq(quotes.user_id, userId),
            like(quotes.quote_number, `${prefix}%`)
        ))
        .orderBy(desc(quotes.id))
        .limit(1);

    let nextNum = 1;
    if (result.length > 0) {
        const lastNum = parseInt(result[0].quote_number.split('-').pop() || '0', 10);
        nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

export async function getAllQuotes(status?: string): Promise<Quote[]> {
    const userId = await requireUserId();

    const conditions = [eq(quotes.user_id, userId)];
    if (status) {
        conditions.push(eq(quotes.status, status));
    }

    const result = await db.select()
        .from(quotes)
        .where(and(...conditions))
        .orderBy(desc(quotes.created_at));

    return result.map(mapQuote);
}

export async function getQuoteById(id: number): Promise<Quote | undefined> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(quotes)
        .where(and(eq(quotes.id, id), eq(quotes.user_id, userId)));

    if (result.length === 0) return undefined;

    const quote = mapQuote(result[0]);

    const items = await db.select().from(quoteItems).where(eq(quoteItems.quote_id, id));
    quote.items = items.map(mapQuoteItem);

    return quote;
}

export async function getQuoteByNumber(quoteNumber: string): Promise<Quote | undefined> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(quotes)
        .where(and(eq(quotes.quote_number, quoteNumber), eq(quotes.user_id, userId)));

    if (result.length === 0) return undefined;

    const quote = mapQuote(result[0]);

    const items = await db.select().from(quoteItems).where(eq(quoteItems.quote_id, quote.id));
    quote.items = items.map(mapQuoteItem);

    return quote;
}

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
    const userId = await requireUserId();

    // Calculate totals
    let subtotal = 0;
    const itemsWithTotals = input.items.map(item => {
        const lineTotal = item.unit_price * item.quantity;
        subtotal += lineTotal;
        return { ...item, line_total: lineTotal };
    });

    const discountPercent = input.discount_percent || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    const quoteNumber = await generateQuoteNumber(userId);

    const result = await db.transaction(async (tx) => {
        const [insertedQuote] = await tx.insert(quotes).values({
            user_id: userId,
            quote_number: quoteNumber,
            customer_name: input.customer_name,
            customer_email: input.customer_email ?? null,
            customer_phone: input.customer_phone ?? null,
            customer_address: input.customer_address ?? null,
            subtotal,
            discount_percent: discountPercent,
            discount_amount: discountAmount,
            total,
            notes: input.notes ?? null,
            valid_until: input.valid_until ?? null,
            status: 'draft',
        }).returning();

        if (itemsWithTotals.length > 0) {
            await tx.insert(quoteItems).values(
                itemsWithTotals.map(item => ({
                    quote_id: insertedQuote.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_sku: item.product_sku,
                    unit_price: item.unit_price,
                    quantity: item.quantity,
                    line_total: item.line_total,
                }))
            );
        }
        return insertedQuote;
    });

    return (await getQuoteById(result.id))!;
}

export async function updateQuote(id: number, input: UpdateQuoteInput): Promise<Quote | undefined> {
    const existing = await getQuoteById(id);
    if (!existing) return undefined;

    await db.transaction(async (tx) => {
        if (input.items) {
            // Delete existing items
            await tx.delete(quoteItems).where(eq(quoteItems.quote_id, id));

            // Calculate new totals
            let subtotal = 0;
            const itemsWithTotals = input.items.map(item => {
                const lineTotal = item.unit_price * item.quantity;
                subtotal += lineTotal;
                return { ...item, line_total: lineTotal };
            });

            const discountPercent = input.discount_percent ?? existing.discount_percent;
            const discountAmount = subtotal * (discountPercent / 100);
            const total = subtotal - discountAmount;

            await tx.update(quotes).set({
                customer_name: input.customer_name ?? existing.customer_name,
                customer_email: input.customer_email ?? existing.customer_email,
                customer_phone: input.customer_phone ?? existing.customer_phone,
                customer_address: input.customer_address ?? existing.customer_address,
                subtotal,
                discount_percent: discountPercent,
                discount_amount: discountAmount,
                total,
                notes: input.notes ?? existing.notes,
                valid_until: input.valid_until ?? existing.valid_until,
                status: input.status ?? existing.status,
                updated_at: new Date(),
            }).where(eq(quotes.id, id));

            if (itemsWithTotals.length > 0) {
                await tx.insert(quoteItems).values(
                    itemsWithTotals.map(item => ({
                        quote_id: id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        product_sku: item.product_sku,
                        unit_price: item.unit_price,
                        quantity: item.quantity,
                        line_total: item.line_total,
                    }))
                );
            }
        } else {
            // Just update non-item fields
            const discountPercent = input.discount_percent ?? existing.discount_percent;
            const discountAmount = existing.subtotal * (discountPercent / 100);
            const total = existing.subtotal - discountAmount;

            await tx.update(quotes).set({
                customer_name: input.customer_name ?? existing.customer_name,
                customer_email: input.customer_email ?? existing.customer_email,
                customer_phone: input.customer_phone ?? existing.customer_phone,
                customer_address: input.customer_address ?? existing.customer_address,
                discount_percent: discountPercent,
                discount_amount: discountAmount,
                total,
                notes: input.notes ?? existing.notes,
                valid_until: input.valid_until ?? existing.valid_until,
                status: input.status ?? existing.status,
                updated_at: new Date(),
            }).where(eq(quotes.id, id));
        }
    });

    return await getQuoteById(id);
}

export async function deleteQuote(id: number): Promise<boolean> {
    const userId = await requireUserId();

    // Ensure user owns this quote
    const result = await db.delete(quotes)
        .where(and(eq(quotes.id, id), eq(quotes.user_id, userId)))
        .returning({ id: quotes.id });
    return result.length > 0;
}

export async function getQuoteStats(): Promise<{ total: number; draft: number; sent: number; approved: number }> {
    const userId = await requireUserId();

    const totalRes = await db.select({ count: sql<number>`count(*)` })
        .from(quotes)
        .where(eq(quotes.user_id, userId));
    const draftRes = await db.select({ count: sql<number>`count(*)` })
        .from(quotes)
        .where(and(eq(quotes.user_id, userId), eq(quotes.status, 'draft')));
    const sentRes = await db.select({ count: sql<number>`count(*)` })
        .from(quotes)
        .where(and(eq(quotes.user_id, userId), eq(quotes.status, 'sent')));
    const approvedRes = await db.select({ count: sql<number>`count(*)` })
        .from(quotes)
        .where(and(eq(quotes.user_id, userId), eq(quotes.status, 'approved')));

    return {
        total: Number(totalRes[0]?.count || 0),
        draft: Number(draftRes[0]?.count || 0),
        sent: Number(sentRes[0]?.count || 0),
        approved: Number(approvedRes[0]?.count || 0)
    };
}
