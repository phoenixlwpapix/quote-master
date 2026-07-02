import { NextRequest, NextResponse } from 'next/server';
import { updateContact, deleteContact } from '@/lib/models/contact';
import { handleApiError, integerFrom, optionalString, requiredString } from '@/lib/route-helpers';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { contactId } = await params;
        const body: Record<string, unknown> = await request.json();

        const contact = await updateContact(integerFrom(contactId, 'Contact ID', { min: 1 }), {
            name: body.name !== undefined ? requiredString(body.name, 'Contact name') : undefined,
            title: optionalString(body.title),
            email: optionalString(body.email),
            phone: optionalString(body.phone),
            is_primary: typeof body.is_primary === 'boolean' ? body.is_primary : undefined,
            notes: optionalString(body.notes),
        });

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        return handleApiError(error, 'Failed to update contact');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { contactId } = await params;
        const deleted = await deleteContact(integerFrom(contactId, 'Contact ID', { min: 1 }));

        if (!deleted) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, 'Failed to delete contact');
    }
}
