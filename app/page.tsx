'use client';

import { useMemo, useState } from 'react';
import { Package, FileText, ShoppingCart, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { PageSkeleton } from '@/components/Skeleton';
import { useProducts, useQuotes, useOrders } from '@/hooks/use-queries';
import type { Order, Quote } from '@/lib/types';

// ─── Shared helpers ────────────────────────────────────────────────────────

const ORDER_STATUS_CFG = {
  pending:    { label: 'Pending',    hex: '#f59e0b' },
  processing: { label: 'Processing', hex: '#3b82f6' },
  completed:  { label: 'Completed',  hex: '#10b981' },
  cancelled:  { label: 'Cancelled',  hex: '#ef4444' },
} satisfies Record<Order['status'], { label: string; hex: string }>;

const ORDER_STATUS_ORDER: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

// ─── Donut Chart ────────────────────────────────────────────────────────────

function DonutChart({ segments }: {
  segments: { label: string; value: number; hex: string }[];
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 44;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  const gap = 2; // gap between segments in px

  let cursor = -90; // start from top
  const arcs = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const arcLen = Math.max(pct * circ - gap, 0);
    const rot = cursor;
    cursor += pct * 360;
    return { ...seg, arcLen, rot, pct };
  });

  return (
    <svg viewBox="0 0 120 120" className="w-36 h-36 shrink-0">
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={14} />
      ) : (
        arcs.map((arc, i) => arc.arcLen > 0 && (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.hex}
            strokeWidth={14}
            strokeDasharray={`${arc.arcLen} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(${arc.rot} ${cx} ${cy})`}
          />
        ))
      )}
    </svg>
  );
}

// ─── Order Revenue Pie ──────────────────────────────────────────────────────

function OrderRevenuePie({ orders }: { orders: Order[] }) {
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
    return ORDER_STATUS_ORDER.map(status => {
      const group = filtered.filter(o => o.status === status);
      return {
        status,
        count: group.length,
        total: group.reduce((s, o) => s + o.total, 0),
        ...ORDER_STATUS_CFG[status],
      };
    });
  }, [orders, year]);

  const grandTotal = byStatus.reduce((s, b) => s + b.total, 0);
  const segments = byStatus.map(b => ({ label: b.label, value: b.total, hex: b.hex }));

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Order Revenue</h2>
          <p className="text-sm text-slate-400 mt-0.5">{fmt(grandTotal)} total</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="text-sm py-1.5 px-3 w-24"
        >
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-6 flex-1">
        <DonutChart segments={segments} />

        <div className="flex-1 space-y-2.5 min-w-0">
          {byStatus.map(({ status, label, count, total, hex }) => {
            const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
                    <span className="text-xs text-slate-300 truncate">{label}</span>
                    <span className="text-xs text-slate-500 shrink-0">({count})</span>
                  </div>
                  <span className="text-xs font-medium text-white shrink-0 ml-2">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: hex }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {grandTotal === 0 && (
        <p className="text-center text-slate-500 text-sm mt-4">No orders in {year}</p>
      )}
    </div>
  );
}

// ─── Quote Conversion Chart ─────────────────────────────────────────────────

const QUOTE_STATUS_CFG = {
  draft:    { label: 'Draft',    hex: '#64748b' },
  sent:     { label: 'Sent',     hex: '#3b82f6' },
  approved: { label: 'Approved', hex: '#10b981' },
  rejected: { label: 'Rejected', hex: '#ef4444' },
  expired:  { label: 'Expired',  hex: '#f59e0b' },
} as const;

function QuoteConversionChart({ quotes }: { quotes: Quote[] }) {
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    quotes.forEach(q => years.add(new Date(q.created_at).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [quotes, currentYear]);

  const [year, setYear] = useState(currentYear);

  const stats = useMemo(() => {
    const filtered = quotes.filter(q => new Date(q.created_at).getFullYear() === year);
    const total = filtered.length;
    const byStatus = (Object.keys(QUOTE_STATUS_CFG) as (keyof typeof QUOTE_STATUS_CFG)[]).map(s => ({
      status: s,
      count: filtered.filter(q => q.status === s).length,
      amount: filtered.filter(q => q.status === s).reduce((a, q) => a + q.total, 0),
      ...QUOTE_STATUS_CFG[s],
    }));
    const sent = filtered.filter(q => q.status !== 'draft').length;
    const approved = filtered.filter(q => q.status === 'approved').length;
    const sentRate = total > 0 ? (sent / total) * 100 : 0;
    const approvalRate = sent > 0 ? (approved / sent) * 100 : 0;
    return { total, byStatus, sentRate, approvalRate, approved };
  }, [quotes, year]);

  const segments = stats.byStatus.map(b => ({ label: b.label, value: b.count, hex: b.hex }));
  const maxCount = Math.max(...stats.byStatus.map(b => b.count), 1);

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Quote Conversion</h2>
          <p className="text-sm text-slate-400 mt-0.5">{stats.total} quotes total</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="text-sm py-1.5 px-3 w-24"
        >
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Conversion rate KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-lg bg-slate-700/30 px-3 py-2.5 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.sentRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Send Rate</p>
        </div>
        <div className="rounded-lg bg-slate-700/30 px-3 py-2.5 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.approvalRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Approval Rate</p>
        </div>
      </div>

      {/* Status bars */}
      <div className="flex items-end gap-6 flex-1">
        <DonutChart segments={segments} />
        <div className="flex-1 space-y-2.5 min-w-0">
          {stats.byStatus.map(({ status, label, count, hex }) => {
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
                    <span className="text-xs text-slate-300">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: hex }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {stats.total === 0 && (
        <p className="text-center text-slate-500 text-sm mt-4">No quotes in {year}</p>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderRevenuePie orders={orders} />
        <QuoteConversionChart quotes={quotes} />
      </div>

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
