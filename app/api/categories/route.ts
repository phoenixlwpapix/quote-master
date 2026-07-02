import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/models/category';
import { handleApiError, requiredString } from '@/lib/route-helpers';

export async function GET() {
    try {
        const categories = await getAllCategories();
        return NextResponse.json(categories);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch categories');
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const category = await createCategory({ name: requiredString(body.name, 'Name') });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'Failed to create category');
    }
}
