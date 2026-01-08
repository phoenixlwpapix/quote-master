import { Suspense } from 'react';
import { getAllProducts } from '@/lib/models/product';
import { getAllCategories } from '@/lib/models/category';
import ProductsClient from './products-client';

export const dynamic = 'force-dynamic';

function ProductsLoading() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading...</div>
        </div>
    );
}

export default async function ProductsPage() {
    // 服务端直接获取数据
    const products = await getAllProducts();
    const categories = await getAllCategories();

    // 使用 Suspense 包裹 Client Component（因为它使用 useSearchParams）
    return (
        <Suspense fallback={<ProductsLoading />}>
            <ProductsClient
                initialProducts={products}
                initialCategories={categories}
            />
        </Suspense>
    );
}
