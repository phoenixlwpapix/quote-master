import { NextRequest, NextResponse } from 'next/server';
import { getContactsByCustomerId, createContact } from '@/lib/models/contact';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contacts = await getContactsByCustomerId(parseInt(id, 10));
        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.name || typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Contact name is required' }, { status: 400 });
        }

        const contact = await createContact(parseInt(id, 10), {
            name: body.name.trim(),
            title: body.title?.trim() || null,
            email: body.email?.trim() || null,
            phone: body.phone?.trim() || null,
            is_primary: body.is_primary ?? false,
            notes: body.notes?.trim() || null,
        });

        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
