import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/models/product';
import { handleApiError, integerFrom, numberFrom, optionalString, requiredString } from '@/lib/route-helpers';
import type { ProductType, UpdateProductInput } from '@/lib/types';

const PRODUCT_TYPES: ProductType[] = ['solution', 'oem_kit', 'accessories', 'software'];

function productTypeFrom(value: unknown): ProductType | undefined {
    if (value === undefined) return undefined;
    return typeof value === 'string' && PRODUCT_TYPES.includes(value as ProductType)
        ? value as ProductType
        : undefined;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await getProductById(integerFrom(id, 'Product ID', { min: 1 }));

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch product');
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Record<string, unknown> = await request.json();
        const productId = integerFrom(id, 'Product ID', { min: 1 });
        const updateData: UpdateProductInput = {};

        updateData.product_type = productTypeFrom(body.product_type);
        if (body.sku !== undefined) updateData.sku = requiredString(body.sku, 'SKU');
        if (body.name !== undefined) updateData.name = requiredString(body.name, 'Name');
        if (body.description !== undefined) updateData.description = optionalString(body.description);
        if (body.unit_price !== undefined) updateData.unit_price = numberFrom(body.unit_price, 'Unit price', { min: 0 });
        if (body.category_id !== undefined) {
            updateData.category_id = body.category_id === '' || body.category_id === null
                ? null
                : integerFrom(body.category_id, 'Category ID', { min: 1 });
        }

        const product = await updateProduct(productId, updateData);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return handleApiError(error, 'Failed to update product');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteProduct(integerFrom(id, 'Product ID', { min: 1 }));

        if (!deleted) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, 'Failed to delete product');
    }
}
