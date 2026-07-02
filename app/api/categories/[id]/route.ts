import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/models/category';
import { handleApiError, integerFrom, requiredString } from '@/lib/route-helpers';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const categoryId = integerFrom(id, 'Category ID', { min: 1 });

        const category = await updateCategory(categoryId, requiredString(body.name, 'Name'));
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        return handleApiError(error, 'Failed to update category');
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const deleted = await deleteCategory(integerFrom(id, 'Category ID', { min: 1 }));
        if (!deleted) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleApiError(error, 'Failed to delete category');
    }
}
