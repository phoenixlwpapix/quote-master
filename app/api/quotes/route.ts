import { NextRequest, NextResponse } from 'next/server';
import { getAllQuotes, createQuote, getQuoteStats } from '@/lib/models/quote';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const stats = searchParams.get('stats');

        if (stats === 'true') {
            const quoteStats = await getQuoteStats();
            return NextResponse.json(quoteStats);
        }

        const quotes = status ? await getAllQuotes(status) : await getAllQuotes();
        return NextResponse.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.customer_name || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Customer name and at least one item are required' },
                { status: 400 }
            );
        }

        // Validate items
        for (const item of body.items) {
            if (!item.product_id || !item.product_name || !item.product_sku ||
                item.unit_price === undefined || !item.quantity) {
                return NextResponse.json(
                    { error: 'Each item must have product_id, product_name, product_sku, unit_price, and quantity' },
                    { status: 400 }
                );
            }
        }

        const quote = await createQuote({
            customer_name: body.customer_name.trim(),
            customer_email: body.customer_email?.trim(),
            customer_phone: body.customer_phone?.trim(),
            customer_address: body.customer_address?.trim(),
            discount_percent: body.discount_percent ? parseFloat(body.discount_percent) : 0,
            notes: body.notes?.trim(),
            valid_until: body.valid_until,
            items: body.items.map((item: { product_id: number; product_name: string; product_sku: string; unit_price: number; quantity: number }) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                product_sku: item.product_sku,
                unit_price: parseFloat(String(item.unit_price)),
                quantity: parseInt(String(item.quantity), 10),
            })),
        });

        return NextResponse.json(quote, { status: 201 });
    } catch (error) {
        console.error('Error creating quote:', error);
        return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
    }
}
