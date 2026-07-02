import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, deleteOrder } from '@/lib/models/order';
import { handleApiError, integerFrom, optionalDateString, optionalString, ValidationError } from '@/lib/route-helpers';
import type { Order, UpdateOrderInput } from '@/lib/types';

const ORDER_STATUSES: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];

function orderStatusFrom(value: unknown): Order['status'] | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== 'string' || !ORDER_STATUSES.includes(value as Order['status'])) {
        throw new ValidationError('Invalid order status');
    }
    return value as Order['status'];
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await getOrderById(integerFrom(id, 'Order ID', { min: 1 }));

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch order');
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Record<string, unknown> = await request.json();
        const orderId = integerFrom(id, 'Order ID', { min: 1 });
        const updateData: UpdateOrderInput = {};

        updateData.status = orderStatusFrom(body.status);
        if (body.issue_date !== undefined) updateData.issue_date = optionalDateString(body.issue_date) ?? null;
        if (body.delivery_weeks !== undefined) {
            updateData.delivery_weeks = body.delivery_weeks ? integerFrom(body.delivery_weeks, 'Delivery weeks', { min: 1 }) : null;
        }
        if (body.notes !== undefined) updateData.notes = optionalString(body.notes) ?? '';

        const order = await updateOrder(orderId, updateData);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return handleApiError(error, 'Failed to update order');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteOrder(integerFrom(id, 'Order ID', { min: 1 }));

        if (!deleted) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, 'Failed to delete order');
    }
}
