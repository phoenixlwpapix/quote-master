'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, RefreshCw } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useOrders } from '@/hooks/use-queries';
import type { Order } from '@/lib/types';

interface OrdersClientProps {
    initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('');

    // 使用 React Query 进行数据管理，支持缓存
    const { data: orders = initialOrders, isLoading, isFetching, refetch } = useOrders(initialOrders);

    // 根据状态过滤数据（客户端过滤，避免额外请求）
    const filteredOrders = statusFilter
        ? orders.filter((o) => o.status === statusFilter)
        : orders;

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

    const columns = [
        { key: 'order_number', label: 'Order #', sortable: true },
        { key: 'customer_name', label: 'Customer', sortable: true },
        {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (order: Order) => (
                <span className="font-medium">{formatCurrency(order.total)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (order: Order) => <StatusBadge status={order.status} type="order" />,
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (order: Order) => formatDate(order.created_at),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (order: Order) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                        href={`/orders/${order.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Eye size={16} />
                    </Link>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders</h1>
                    <p className="text-slate-400 mt-1">Track and manage your orders</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="btn btn-secondary"
                    title="Refresh data"
                >
                    <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {isFetching && !isLoading && (
                    <span className="text-slate-400 text-sm">Updating...</span>
                )}
            </div>

            {/* Orders Table */}
            <DataTable
                data={filteredOrders}
                columns={columns}
                onRowClick={(order) => router.push(`/orders/${order.id}`)}
                searchable
                searchPlaceholder="Search orders..."
                emptyMessage="No orders found. Orders are created by converting approved quotes."
            />
        </div>
    );
}
