import { NextRequest, NextResponse } from 'next/server';
import { convertQuoteToOrder } from '@/lib/models/order';
import { getQuoteById } from '@/lib/models/quote';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quoteId = parseInt(id, 10);

        // Check if quote exists
        const quote = await getQuoteById(quoteId);
        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        // Check if quote is in a valid state for conversion
        if (quote.status !== 'approved') {
            return NextResponse.json(
                { error: 'Can only convert an approved quote to an order' },
                { status: 400 }
            );
        }

        const order = await convertQuoteToOrder(quoteId);

        if (!order) {
            return NextResponse.json({ error: 'Failed to convert quote to order' }, { status: 500 });
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error converting quote to order:', error);
        return NextResponse.json({ error: 'Failed to convert quote to order' }, { status: 500 });
    }
}
