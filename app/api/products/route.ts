import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct, searchProducts } from '@/lib/models/product';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category');
        const search = searchParams.get('search');

        let products;
        if (search) {
            products = await searchProducts(search);
        } else if (categoryId) {
            products = await getAllProducts(parseInt(categoryId, 10));
        } else {
            products = await getAllProducts();
        }

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.sku || !body.name || body.unit_price === undefined) {
            return NextResponse.json(
                { error: 'SKU, name, and unit_price are required' },
                { status: 400 }
            );
        }

        const product = await createProduct({
            sku: body.sku.trim(),
            name: body.name.trim(),
            description: body.description?.trim() || null,
            unit_price: parseFloat(body.unit_price),
            category_id: body.category_id ? parseInt(body.category_id, 10) : null,
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        if ((error as Error).message?.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
