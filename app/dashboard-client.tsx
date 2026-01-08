'use client';

import { Package, FileText, ShoppingCart, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { useProducts, useQuotes, useOrders } from '@/hooks/use-queries';
import type { Product, Quote, Order } from '@/lib/types';

interface DashboardProps {
    initialProducts: Product[];
    initialQuotes: Quote[];
    initialOrders: Order[];
}

export default function Dashboard({
    initialProducts,
    initialQuotes,
    initialOrders,
}: DashboardProps) {
    // 使用 React Query 进行数据管理，支持缓存
    const { data: products = initialProducts, isFetching: productsFetching, refetch: refetchProducts } = useProducts(initialProducts);
    const { data: quotes = initialQuotes, isFetching: quotesFetching, refetch: refetchQuotes } = useQuotes(initialQuotes);
    const { data: orders = initialOrders, isFetching: ordersFetching, refetch: refetchOrders } = useOrders(initialOrders);

    const isFetching = productsFetching || quotesFetching || ordersFetching;

    // 从缓存数据计算统计信息
    const quoteStats = {
        draft: quotes.filter(q => q.status === 'draft').length,
        sent: quotes.filter(q => q.status === 'sent').length,
        approved: quotes.filter(q => q.status === 'approved').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
        expired: quotes.filter(q => q.status === 'expired').length,
    };

    const orderStats = {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const recentQuotes = quotes.slice(0, 5);
    const recentOrders = orders.slice(0, 5);

    const stats = [
        {
            label: 'Total Products',
            value: products.length,
            icon: Package,
            color: 'bg-blue-500',
            href: '/products',
        },
        {
            label: 'Active Quotes',
            value: quoteStats.draft + quoteStats.sent,
            icon: FileText,
            color: 'bg-brand-500',
            href: '/quotes',
        },
        {
            label: 'Pending Orders',
            value: orderStats.pending + orderStats.processing,
            icon: ShoppingCart,
            color: 'bg-amber-500',
            href: '/orders',
        },
        {
            label: 'Completed Orders',
            value: orderStats.completed,
            icon: TrendingUp,
            color: 'bg-purple-500',
            href: '/orders?status=completed',
        },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleRefresh = () => {
        refetchProducts();
        refetchQuotes();
        refetchOrders();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Overview of your quotes and orders</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="btn btn-secondary"
                    title="Refresh all data"
                >
                    <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="card card-hover group"
                        >
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotes */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Recent Quotes</h2>
                        <Link href="/quotes" className="text-brand-400 hover:text-brand-300 text-sm">
                            View all →
                        </Link>
                    </div>

                    {recentQuotes.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No quotes yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentQuotes.map((quote) => (
                                <Link
                                    key={quote.id}
                                    href={`/quotes/${quote.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                                >
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
                        <Link href="/orders" className="text-brand-400 hover:text-brand-300 text-sm">
                            View all →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                                >
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

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link href="/quotes/new" className="btn btn-primary">
                        <FileText size={18} />
                        Create New Quote
                    </Link>
                    <Link href="/products?new=true" className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
                    </Link>

                </div>
            </div>
        </div>
    );
}
