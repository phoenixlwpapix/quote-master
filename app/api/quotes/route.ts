import { NextRequest, NextResponse } from 'next/server';
import { getAllQuotes, createQuote, getQuoteStats } from '@/lib/models/quote';
import { handleApiError, integerFrom, numberFrom, optionalDateString, optionalString, requiredString, ValidationError } from '@/lib/route-helpers';
import type { CreateQuoteInput, Quote } from '@/lib/types';

const QUOTE_STATUSES: Quote['status'][] = ['draft', 'sent', 'approved', 'rejected', 'expired'];

function quoteStatusFrom(value: string | null): Quote['status'] | undefined {
    if (!value) return undefined;
    if (!QUOTE_STATUSES.includes(value as Quote['status'])) {
        throw new ValidationError('Invalid quote status');
    }
    return value as Quote['status'];
}

function quoteItemsFrom(value: unknown): CreateQuoteInput['items'] {
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = quoteStatusFrom(searchParams.get('status'));
        const stats = searchParams.get('stats');

        if (stats === 'true') {
            const quoteStats = await getQuoteStats();
            return NextResponse.json(quoteStats);
        }

        const quotes = status ? await getAllQuotes(status) : await getAllQuotes();
        return NextResponse.json(quotes);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch quotes');
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: Record<string, unknown> = await request.json();

        const quote = await createQuote({
            customer_name: requiredString(body.customer_name, 'Customer name'),
            customer_email: optionalString(body.customer_email) ?? undefined,
            customer_phone: optionalString(body.customer_phone) ?? undefined,
            customer_address: optionalString(body.customer_address) ?? undefined,
            discount_percent: body.discount_percent ? numberFrom(body.discount_percent, 'Discount percent', { min: 0, max: 100 }) : 0,
            shipping_fee: body.shipping_fee ? numberFrom(body.shipping_fee, 'Shipping fee', { min: 0 }) : 0,
            incoterm: optionalString(body.incoterm) ?? undefined,
            delivery_weeks: body.delivery_weeks ? integerFrom(body.delivery_weeks, 'Delivery weeks', { min: 1 }) : null,
            issue_date: optionalDateString(body.issue_date),
            notes: optionalString(body.notes) ?? undefined,
            valid_until: optionalDateString(body.valid_until),
            items: quoteItemsFrom(body.items),
        });

        return NextResponse.json(quote, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'Failed to create quote');
    }
}
