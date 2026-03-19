import { NextRequest, NextResponse } from 'next/server';
import { updateContact, deleteContact } from '@/lib/models/contact';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { contactId } = await params;
        const body = await request.json();

        const contact = await updateContact(parseInt(contactId, 10), {
            name: body.name?.trim(),
            title: body.title?.trim() || null,
            email: body.email?.trim() || null,
            phone: body.phone?.trim() || null,
            is_primary: body.is_primary,
            notes: body.notes?.trim() || null,
        });

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { contactId } = await params;
        const deleted = await deleteContact(parseInt(contactId, 10));

        if (!deleted) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contact:', error);
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
}
