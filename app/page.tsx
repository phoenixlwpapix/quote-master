import Dashboard from './dashboard-client';
import { getAllProducts } from '@/lib/models/product';
import { getAllQuotes } from '@/lib/models/quote';
import { getAllOrders } from '@/lib/models/order';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 服务端获取初始数据
  const [products, quotes, orders] = await Promise.all([
    getAllProducts(),
    getAllQuotes(),
    getAllOrders(),
  ]);

  return (
    <Dashboard
      initialProducts={products}
      initialQuotes={quotes}
      initialOrders={orders}
    />
  );
}
