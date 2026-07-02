import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer, deleteCustomer } from '@/lib/models/customer';
import { getContactsByCustomerId } from '@/lib/models/contact';
import { handleApiError, integerFrom, optionalString, requiredString } from '@/lib/route-helpers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = integerFrom(id, 'Customer ID', { min: 1 });
        const customer = await getCustomerById(customerId);

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const contacts = await getContactsByCustomerId(customerId);
        return NextResponse.json({ ...customer, contacts });
    } catch (error) {
        return handleApiError(error, 'Failed to fetch customer');
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Record<string, unknown> = await request.json();

        const customer = await updateCustomer(integerFrom(id, 'Customer ID', { min: 1 }), {
            name: body.name !== undefined ? requiredString(body.name, 'Company name') : undefined,
            address: optionalString(body.address),
            website: optionalString(body.website),
            industry: optionalString(body.industry),
            notes: optionalString(body.notes),
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        return handleApiError(error, 'Failed to update customer');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteCustomer(integerFrom(id, 'Customer ID', { min: 1 }));

        if (!deleted) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, 'Failed to delete customer');
    }
}
