import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById, updateQuote, deleteQuote } from '@/lib/models/quote';
import { handleApiError, integerFrom, numberFrom, optionalDateString, optionalString, requiredString, ValidationError } from '@/lib/route-helpers';
import type { Quote, UpdateQuoteInput } from '@/lib/types';

const QUOTE_STATUSES: Quote['status'][] = ['draft', 'sent', 'approved', 'rejected', 'expired'];

function quoteStatusFrom(value: unknown): Quote['status'] | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== 'string' || !QUOTE_STATUSES.includes(value as Quote['status'])) {
        throw new ValidationError('Invalid quote status');
    }
    return value as Quote['status'];
}

function quoteItemsFrom(value: unknown): UpdateQuoteInput['items'] {
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || value.length === 0) {
        throw new ValidationError('At least one item is required');
    }

    return value.map((item, index) => {
        if (!item || typeof item !== 'object') {
            throw new ValidationError(`Item ${index + 1} is invalid`);
        }
        const row = item as Record<string, unknown>;
        return {
            product_id: integerFrom(row.product_id, `Item ${index + 1} product`, { min: 1 }),
            product_name: requiredString(row.product_name, `Item ${index + 1} name`),
            product_sku: requiredString(row.product_sku, `Item ${index + 1} SKU`),
            unit_price: numberFrom(row.unit_price, `Item ${index + 1} unit price`, { min: 0 }),
            quantity: integerFrom(row.quantity, `Item ${index + 1} quantity`, { min: 1 }),
        };
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quote = await getQuoteById(integerFrom(id, 'Quote ID', { min: 1 }));

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch quote');
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Record<string, unknown> = await request.json();
        const quoteId = integerFrom(id, 'Quote ID', { min: 1 });

        const updateData: Parameters<typeof updateQuote>[1] = {};

        if (body.customer_name !== undefined) updateData.customer_name = requiredString(body.customer_name, 'Customer name');
        if (body.customer_email !== undefined) updateData.customer_email = optionalString(body.customer_email) ?? undefined;
        if (body.customer_phone !== undefined) updateData.customer_phone = optionalString(body.customer_phone) ?? undefined;
        if (body.customer_address !== undefined) updateData.customer_address = optionalString(body.customer_address) ?? undefined;
        if (body.discount_percent !== undefined) updateData.discount_percent = numberFrom(body.discount_percent, 'Discount percent', { min: 0, max: 100 });
        if (body.shipping_fee !== undefined) updateData.shipping_fee = numberFrom(body.shipping_fee, 'Shipping fee', { min: 0 });
        if (body.incoterm !== undefined) updateData.incoterm = optionalString(body.incoterm) ?? undefined;
        if (body.delivery_weeks !== undefined) updateData.delivery_weeks = body.delivery_weeks ? integerFrom(body.delivery_weeks, 'Delivery weeks', { min: 1 }) : null;
        if (body.issue_date !== undefined) updateData.issue_date = optionalDateString(body.issue_date);
        if (body.notes !== undefined) updateData.notes = optionalString(body.notes) ?? undefined;
        if (body.valid_until !== undefined) updateData.valid_until = optionalDateString(body.valid_until);
        updateData.status = quoteStatusFrom(body.status);
        updateData.items = quoteItemsFrom(body.items);

        const quote = await updateQuote(quoteId, updateData);

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        return handleApiError(error, 'Failed to update quote');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteQuote(integerFrom(id, 'Quote ID', { min: 1 }));

        if (!deleted) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, 'Failed to delete quote');
    }
}
