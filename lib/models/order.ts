import 'server-only';

import { db } from '../db';
import { orders, orderItems, quotes } from '../schema';
import { eq, desc, like, sql, and } from 'drizzle-orm';
import type { Order, OrderItem, UpdateOrderInput } from '../types';
import { getQuoteById } from './quote';
import { requireUserId } from '../auth/get-user';

function mapOrder(row: typeof orders.$inferSelect): Order {
    return {
        ...row,
        created_at: row.created_at?.toISOString() ?? new Date().toISOString(),
        updated_at: row.updated_at?.toISOString() ?? new Date().toISOString(),
        status: row.status as Order['status'],
    };
}

function mapOrderItem(row: typeof orderItems.$inferSelect): OrderItem {
    return {
        ...row,
        order_id: row.order_id ?? undefined,
        id: row.id,
    };
}

async function generateOrderNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    // Query only this user's orders for per-user numbering
    const result = await db.select({ order_number: orders.order_number })
        .from(orders)
        .where(and(
            eq(orders.user_id, userId),
            like(orders.order_number, `${prefix}%`)
        ))
        .orderBy(desc(orders.id))
        .limit(1);

    let nextNum = 1;
    if (result.length > 0) {
        const lastNum = parseInt(result[0].order_number.split('-').pop() || '0', 10);
        nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

export async function getAllOrders(status?: string): Promise<Order[]> {
    const userId = await requireUserId();

    const conditions = [eq(orders.user_id, userId)];
    if (status) {
        conditions.push(eq(orders.status, status));
    }

    const result = await db.select()
        .from(orders)
        .where(and(...conditions))
        .orderBy(desc(orders.created_at));

    return result.map(mapOrder);
}

export async function getOrderById(id: number): Promise<Order | undefined> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(orders)
        .where(and(eq(orders.id, id), eq(orders.user_id, userId)));

    if (result.length === 0) return undefined;

    const order = mapOrder(result[0]);
    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, id));
    order.items = items.map(mapOrderItem);

    return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(orders)
        .where(and(eq(orders.order_number, orderNumber), eq(orders.user_id, userId)));

    if (result.length === 0) return undefined;

    const order = mapOrder(result[0]);
    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id));
    order.items = items.map(mapOrderItem);

    return order;
}

export async function convertQuoteToOrder(quoteId: number): Promise<Order | undefined> {
    const userId = await requireUserId();
    const quote = await getQuoteById(quoteId);

    if (!quote || !quote.items) return undefined;

    const orderNumber = await generateOrderNumber(userId);

    const result = await db.transaction(async (tx) => {
        const [insertedOrder] = await tx.insert(orders).values({
            user_id: userId,
            order_number: orderNumber,
            quote_id: quoteId,
            customer_name: quote.customer_name,
            customer_email: quote.customer_email,
            customer_phone: quote.customer_phone,
            customer_address: quote.customer_address,
            subtotal: quote.subtotal,
            discount_percent: quote.discount_percent,
            discount_amount: quote.discount_amount,
            total: quote.total,
            notes: quote.notes,
            status: 'pending',
        }).returning();

        if (quote.items && quote.items.length > 0) {
            await tx.insert(orderItems).values(
                quote.items.map(item => ({
                    order_id: insertedOrder.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_sku: item.product_sku,
                    unit_price: item.unit_price,
                    quantity: item.quantity,
                    line_total: item.line_total,
                }))
            );
        }

        // Update quote status
        await tx.update(quotes).set({
            status: 'approved',
            updated_at: new Date(),
        }).where(eq(quotes.id, quoteId));

        return insertedOrder;
    });

    return await getOrderById(result.id);
}

export async function updateOrder(id: number, input: UpdateOrderInput): Promise<Order | undefined> {
    const existing = await getOrderById(id);
    if (!existing) return undefined;

    await db.update(orders).set({
        status: input.status ?? existing.status,
        notes: input.notes ?? existing.notes,
        updated_at: new Date(),
    }).where(eq(orders.id, id));

    return await getOrderById(id);
}

export async function deleteOrder(id: number): Promise<boolean> {
    const userId = await requireUserId();

    const result = await db.delete(orders)
        .where(and(eq(orders.id, id), eq(orders.user_id, userId)))
        .returning({ id: orders.id });
    return result.length > 0;
}

export async function getOrderStats(): Promise<{ total: number; pending: number; processing: number; completed: number; cancelled: number }> {
    const userId = await requireUserId();

    const totalRes = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.user_id, userId));
    const pendingRes = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(eq(orders.user_id, userId), eq(orders.status, 'pending')));
    const processingRes = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(eq(orders.user_id, userId), eq(orders.status, 'processing')));
    const completedRes = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(eq(orders.user_id, userId), eq(orders.status, 'completed')));
    const cancelledRes = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(eq(orders.user_id, userId), eq(orders.status, 'cancelled')));

    return {
        total: Number(totalRes[0]?.count || 0),
        pending: Number(pendingRes[0]?.count || 0),
        processing: Number(processingRes[0]?.count || 0),
        completed: Number(completedRes[0]?.count || 0),
        cancelled: Number(cancelledRes[0]?.count || 0),
    };
}
