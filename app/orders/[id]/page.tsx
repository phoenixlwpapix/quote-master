import { getOrderById } from '@/lib/models/order';
import { notFound } from 'next/navigation';
import OrderDetailClient from './order-detail-client';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;
    const order = await getOrderById(Number(id));

    // 使用 Next.js 内置的 404 处理
    if (!order) {
        notFound();
    }

    // 将预获取的数据传递给 Client Component
    return <OrderDetailClient order={order} />;
}
