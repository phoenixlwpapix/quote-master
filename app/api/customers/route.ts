import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, createCustomer, searchCustomers } from '@/lib/models/customer';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const customers = search ? await searchCustomers(search) : await getAllCustomers();
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const customer = await createCustomer({
            name: body.name.trim(),
            email: body.email?.trim() || null,
            phone: body.phone?.trim() || null,
            address: body.address?.trim() || null,
            company: body.company?.trim() || null,
            notes: body.notes?.trim() || null,
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
