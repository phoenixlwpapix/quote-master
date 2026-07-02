import { NextRequest, NextResponse } from 'next/server';
import { convertQuoteToOrder } from '@/lib/models/order';
import { handleApiError, integerFrom } from '@/lib/route-helpers';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quoteId = integerFrom(id, 'Quote ID', { min: 1 });

        const order = await convertQuoteToOrder(quoteId);

        if (!order) {
            return NextResponse.json({ error: 'Failed to convert quote to order' }, { status: 500 });
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'Failed to convert quote to order');
    }
}
