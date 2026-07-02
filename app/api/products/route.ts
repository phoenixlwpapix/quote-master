import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct, searchProducts } from '@/lib/models/product';
import { handleApiError, integerFrom, numberFrom, optionalString, requiredString } from '@/lib/route-helpers';
import type { ProductType } from '@/lib/types';

const PRODUCT_TYPES: ProductType[] = ['solution', 'oem_kit', 'accessories', 'software'];

function productTypeFrom(value: unknown): ProductType {
    return typeof value === 'string' && PRODUCT_TYPES.includes(value as ProductType)
        ? value as ProductType
        : 'solution';
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category');
        const search = searchParams.get('search');

        let products;
        if (search) {
            products = await searchProducts(search);
        } else if (categoryId) {
            products = await getAllProducts(integerFrom(categoryId, 'Category ID', { min: 1 }));
        } else {
            products = await getAllProducts();
        }

        return NextResponse.json(products);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch products');
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: Record<string, unknown> = await request.json();
        const product = await createProduct({
            product_type: productTypeFrom(body.product_type),
            sku: requiredString(body.sku, 'SKU'),
            name: requiredString(body.name, 'Name'),
            description: optionalString(body.description),
            unit_price: numberFrom(body.unit_price, 'Unit price', { min: 0 }),
            category_id: body.category_id ? integerFrom(body.category_id, 'Category ID', { min: 1 }) : null,
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'Failed to create product');
    }
}
