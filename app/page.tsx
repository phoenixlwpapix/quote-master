'use client';

import { useMemo, useState } from 'react';
import { Package, FileText, ShoppingCart, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { PageSkeleton } from '@/components/Skeleton';
import { useProducts, useQuotes, useOrders } from '@/hooks/use-queries';
import type { Order } from '@/lib/types';

// ─── Order Revenue Chart ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-500',   bg: 'bg-amber-500/10' },
  processing: { label: 'Processing', color: 'bg-blue-500',    bg: 'bg-blue-500/10' },
  completed:  { label: 'Completed',  color: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-500',     bg: 'bg-red-500/10' },
};

const STATUS_ORDER: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];

function OrderRevenueChart({ orders }: { orders: Order[] }) {
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    orders.forEach(o => years.add(new Date(o.created_at).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [orders, currentYear]);

  const [year, setYear] = useState(currentYear);

  const byStatus = useMemo(() => {
    const filtered = orders.filter(o => new Date(o.created_at).getFullYear() === year);
    return STATUS_ORDER.map(status => {
      const group = filtered.filter(o => o.status === status);
      return {
        status,
        count: group.length,
        total: group.reduce((s, o) => s + o.total, 0),
      };
    });
  }, [orders, year]);

  const maxTotal = Math.max(...byStatus.map(s => s.total), 1);
  const grandTotal = byStatus.reduce((s, b) => s + b.total, 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Order Revenue by Stage</h2>
          <p className="text-sm text-slate-400 mt-0.5">Total: {formatCurrency(grandTotal)}</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="text-sm py-1.5 px-3 w-28"
        >
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {byStatus.map(({ status, count, total }) => {
          const cfg = STATUS_CONFIG[status];
          const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                  <span className="text-sm text-slate-300">{cfg.label}</span>
                  <span className="text-xs text-slate-500">({count} order{count !== 1 ? 's' : ''})</span>
                </div>
                <span className="text-sm font-medium text-white">{formatCurrency(total)}</span>
              </div>
              <div className="h-7 rounded-md bg-slate-700/40 overflow-hidden">
                <div
                  className={`h-full rounded-md ${cfg.color} transition-all duration-700 ease-out flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max(pct, total > 0 ? 2 : 0)}%` }}
                >
                  {pct > 15 && total > 0 && (
                    <span className="text-xs font-medium text-white/90">{pct.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {grandTotal === 0 && (
        <p className="text-center text-slate-500 text-sm mt-4">No orders in {year}</p>
      )}
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: products = [], isLoading: productsLoading, isFetching: productsFetching, refetch: refetchProducts } = useProducts();
  const { data: quotes = [], isLoading: quotesLoading, isFetching: quotesFetching, refetch: refetchQuotes } = useQuotes();
  const { data: orders = [], isLoading: ordersLoading, isFetching: ordersFetching, refetch: refetchOrders } = useOrders();

  const isLoading = productsLoading || quotesLoading || ordersLoading;
  const isFetching = productsFetching || quotesFetching || ordersFetching;

  const quoteStats = {
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    approved: quotes.filter(q => q.status === 'approved').length,
  };

  const orderStats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const recentQuotes = quotes.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: 'Total Products',    value: products.length,                                icon: Package,     color: 'bg-blue-500',    href: '/products' },
    { label: 'Active Quotes',     value: quoteStats.draft + quoteStats.sent,             icon: FileText,    color: 'bg-brand-500',   href: '/quotes' },
    { label: 'Pending Orders',    value: orderStats.pending + orderStats.processing,     icon: ShoppingCart,color: 'bg-amber-500',   href: '/orders' },
    { label: 'Completed Orders',  value: orderStats.completed,                           icon: TrendingUp,  color: 'bg-purple-500',  href: '/orders?status=completed' },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleRefresh = () => { refetchProducts(); refetchQuotes(); refetchOrders(); };

  if (isLoading) return <PageSkeleton hasCards />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your quotes and orders</p>
        </div>
        <button onClick={handleRefresh} disabled={isFetching} className="btn btn-secondary" title="Refresh all data">
          <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="card card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Order Revenue Chart */}
      <OrderRevenueChart orders={orders} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Quotes</h2>
            <Link href="/quotes" className="text-brand-400 hover:text-brand-300 text-sm">View all →</Link>
          </div>
          {recentQuotes.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No quotes yet</p>
          ) : (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <Link key={quote.id} href={`/quotes/${quote.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-white">{quote.quote_number}</p>
                    <p className="text-sm text-slate-400">{quote.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(quote.total)}</p>
                    <StatusBadge status={quote.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link href="/orders" className="text-brand-400 hover:text-brand-300 text-sm">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-white">{order.order_number}</p>
                    <p className="text-sm text-slate-400">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(order.total)}</p>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB — New Quote */}
      <Link
        href="/quotes/new"
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/30 transition-all hover:scale-110 active:scale-95"
        title="New Quote"
      >
        <Plus size={26} />
      </Link>
    </div>
  );
}
