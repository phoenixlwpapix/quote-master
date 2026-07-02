import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getOrderStats } from '@/lib/models/order';
import { handleApiError, ValidationError } from '@/lib/route-helpers';
import type { Order } from '@/lib/types';

const ORDER_STATUSES: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];

function orderStatusFrom(value: string | null): Order['status'] | undefined {
    if (!value) return undefined;
    if (!ORDER_STATUSES.includes(value as Order['status'])) {
        throw new ValidationError('Invalid order status');
    }
    return value as Order['status'];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = orderStatusFrom(searchParams.get('status'));
        const stats = searchParams.get('stats');

        if (stats === 'true') {
            const orderStats = await getOrderStats();
            return NextResponse.json(orderStats);
        }

        const orders = status ? await getAllOrders(status) : await getAllOrders();
        return NextResponse.json(orders);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch orders');
    }
}
