import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById, updateQuote, deleteQuote } from '@/lib/models/quote';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quote = await getQuoteById(parseInt(id, 10));

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error fetching quote:', error);
        return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: Parameters<typeof updateQuote>[1] = {};

        if (body.customer_name) updateData.customer_name = body.customer_name.trim();
        if (body.customer_email !== undefined) updateData.customer_email = body.customer_email?.trim();
        if (body.customer_phone !== undefined) updateData.customer_phone = body.customer_phone?.trim();
        if (body.customer_address !== undefined) updateData.customer_address = body.customer_address?.trim();
        if (body.discount_percent !== undefined) updateData.discount_percent = parseFloat(body.discount_percent);
        if (body.notes !== undefined) updateData.notes = body.notes?.trim();
        if (body.valid_until !== undefined) updateData.valid_until = body.valid_until;
        if (body.status) updateData.status = body.status;

        if (body.items && Array.isArray(body.items)) {
            updateData.items = body.items.map((item: { product_id: number; product_name: string; product_sku: string; unit_price: number; quantity: number }) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                product_sku: item.product_sku,
                unit_price: parseFloat(String(item.unit_price)),
                quantity: parseInt(String(item.quantity), 10),
            }));
        }

        const quote = await updateQuote(parseInt(id, 10), updateData);

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error updating quote:', error);
        return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteQuote(parseInt(id, 10));

        if (!deleted) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting quote:', error);
        return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
    }
}
