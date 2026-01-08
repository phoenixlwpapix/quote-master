'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Trash2, RefreshCw } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import ConfirmModal from '@/components/ConfirmModal';
import { useQuotes, useDeleteQuote } from '@/hooks/use-queries';
import type { Quote } from '@/lib/types';

interface QuotesClientProps {
    initialQuotes: Quote[];
}

export default function QuotesClient({ initialQuotes }: QuotesClientProps) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // 使用 React Query 进行数据管理，支持缓存
    const { data: quotes = initialQuotes, isLoading, isFetching, refetch } = useQuotes(initialQuotes);
    const deleteQuoteMutation = useDeleteQuote();

    // 根据状态过滤数据（客户端过滤，避免额外请求）
    const filteredQuotes = statusFilter
        ? quotes.filter((q) => q.status === statusFilter)
        : quotes;

    const openDeleteModal = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            await deleteQuoteMutation.mutateAsync(deletingId);
        } catch (error) {
            console.error('Error deleting quote:', error);
        } finally {
            setDeleteModalOpen(false);
            setDeletingId(null);
        }
    };

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
        { key: 'quote_number', label: 'Quote #', sortable: true },
        { key: 'customer_name', label: 'Customer', sortable: true },
        {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (quote: Quote) => (
                <span className="font-medium">{formatCurrency(quote.total)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (quote: Quote) => <StatusBadge status={quote.status} />,
        },
        {
            key: 'valid_until',
            label: 'Valid Until',
            render: (quote: Quote) => quote.valid_until ? formatDate(quote.valid_until) : '-',
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (quote: Quote) => formatDate(quote.created_at),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (quote: Quote) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                        href={`/quotes/${quote.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        onClick={(e) => openDeleteModal(quote.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'expired', label: 'Expired' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Quotes</h1>
                    <p className="text-slate-400 mt-1">Manage and track your quotes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="btn btn-secondary"
                        title="Refresh data"
                    >
                        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                    <Link href="/quotes/new" className="btn btn-primary">
                        <Plus size={18} />
                        New Quote
                    </Link>
                </div>
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

            {/* Quotes Table */}
            <DataTable
                data={filteredQuotes}
                columns={columns}
                onRowClick={(quote) => router.push(`/quotes/${quote.id}`)}
                searchable
                searchPlaceholder="Search quotes..."
                emptyMessage="No quotes found. Create your first quote to get started."
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Quote"
                message="Are you sure you want to delete this quote? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleteQuoteMutation.isPending}
            />
        </div>
    );
}
