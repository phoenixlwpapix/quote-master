import { NextRequest, NextResponse } from 'next/server';
import { getContactsByCustomerId, createContact } from '@/lib/models/contact';
import { handleApiError, integerFrom, optionalString, requiredString } from '@/lib/route-helpers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contacts = await getContactsByCustomerId(integerFrom(id, 'Customer ID', { min: 1 }));
        return NextResponse.json(contacts);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch contacts');
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Record<string, unknown> = await request.json();

        const contact = await createContact(integerFrom(id, 'Customer ID', { min: 1 }), {
            name: requiredString(body.name, 'Contact name'),
            title: optionalString(body.title),
            email: optionalString(body.email),
            phone: optionalString(body.phone),
            is_primary: typeof body.is_primary === 'boolean' ? body.is_primary : false,
            notes: optionalString(body.notes),
        });

        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'Failed to create contact');
    }
}
