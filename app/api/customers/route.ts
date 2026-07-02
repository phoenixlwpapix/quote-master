import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, createCustomer, searchCustomers } from '@/lib/models/customer';
import { handleApiError, optionalString, requiredString } from '@/lib/route-helpers';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const customers = search ? await searchCustomers(search) : await getAllCustomers();
        return NextResponse.json(customers);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch customers');
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: Record<string, unknown> = await request.json();

        const customer = await createCustomer({
            name: requiredString(body.name, 'Company name'),
            address: optionalString(body.address),
            website: optionalString(body.website),
            industry: optionalString(body.industry),
            notes: optionalString(body.notes),
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'Failed to create customer');
    }
}
