import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/models/category';

export async function GET() {
    try {
        const categories = await getAllCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const category = await createCategory({ name: body.name.trim() });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        if ((error as Error).message?.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
