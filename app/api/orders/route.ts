import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getOrderStats } from '@/lib/models/order';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const stats = searchParams.get('stats');

        if (stats === 'true') {
            const orderStats = await getOrderStats();
            return NextResponse.json(orderStats);
        }

        const orders = status ? await getAllOrders(status) : await getAllOrders();
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
