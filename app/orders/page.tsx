import { getAllOrders } from '@/lib/models/order';
import OrdersClient from './orders-client';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    // 服务端直接获取数据
    const orders = await getAllOrders();

    // 将数据传递给 Client Component 处理交互逻辑
    return <OrdersClient initialOrders={orders} />;
}
