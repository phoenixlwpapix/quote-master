'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileDown, ShoppingCart, Edit2, Trash2, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import QuoteProgressBar from '@/components/QuoteProgressBar';
import type { Quote } from '@/lib/types';

interface QuoteDetailClientProps {
    quote: Quote;
}

export default function QuoteDetailClient({ quote: initialQuote }: QuoteDetailClientProps) {
    const router = useRouter();
    const [quote, setQuote] = useState<Quote>(initialQuote);
    const [converting, setConverting] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>(quote.status);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleStatusUpdate = async () => {
        if (newStatus === quote.status) return;

        try {
            const res = await fetch(`/api/quotes/${quote.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                const updated = await res.json();
                setQuote(updated);
                setIsStatusModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleConvertToOrder = async () => {
        setConverting(true);
        try {
            const res = await fetch(`/api/quotes/${quote.id}/convert`, {
                method: 'POST',
            });

            if (res.ok) {
                const order = await res.json();
                router.push(`/orders/${order.id}`);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to convert quote');
            }
        } catch (error) {
            console.error('Error converting quote:', error);
            alert('Failed to convert quote');
        } finally {
            setConverting(false);
            setConvertModalOpen(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' });
            router.push('/quotes');
        } catch (error) {
            console.error('Error deleting quote:', error);
        } finally {
            setDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    const handleDownloadPdf = () => {
        window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'expired', label: 'Expired' },
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            {/* Header */}
            <div className="space-y-4">
                {/* Title Row */}
                <div className="flex items-start gap-4">
                    <Link
                        href="/quotes"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors mt-1"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold text-white">{quote.quote_number}</h1>
                            <StatusBadge status={quote.status} />
                        </div>
                        <p className="text-slate-400 mt-1">Created on {formatDate(quote.created_at)}</p>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pl-12">
                    {/* Left group - Secondary actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {quote.status === 'draft' && (
                            <Link
                                href={`/quotes/${quote.id}/edit`}
                                className="btn btn-secondary"
                            >
                                <Edit2 size={18} />
                                Edit Quote
                            </Link>
                        )}
                        <button
                            onClick={() => setIsStatusModalOpen(true)}
                            className="btn btn-secondary"
                        >
                            <RefreshCw size={18} />
                            Update Status
                        </button>
                        <button onClick={handleDownloadPdf} className="btn btn-secondary">
                            <FileDown size={18} />
                            Download PDF
                        </button>
                    </div>

                    {/* Right group - Primary & Danger actions */}
                    <div className="flex items-center gap-2">
                        {quote.status === 'approved' && (
                            <button
                                onClick={() => setConvertModalOpen(true)}
                                className="btn btn-primary"
                                disabled={converting}
                            >
                                <ShoppingCart size={18} />
                                {converting ? 'Converting...' : 'Convert to Order'}
                            </button>
                        )}
                        <button onClick={() => setDeleteModalOpen(true)} className="btn btn-danger">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="card">
                <QuoteProgressBar
                    status={quote.status}
                    createdAt={quote.created_at}
                    updatedAt={quote.updated_at}
                />
            </div>

            {/* Customer Info */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <div>
                        <p className="text-sm text-slate-400">Name</p>
                        <p className="font-medium">{quote.customer_name}</p>
                    </div>
                    {quote.customer_email && (
                        <div>
                            <p className="text-sm text-slate-400">Email</p>
                            <p className="font-medium">{quote.customer_email}</p>
                        </div>
                    )}
                    {quote.customer_phone && (
                        <div>
                            <p className="text-sm text-slate-400">Phone</p>
                            <p className="font-medium">{quote.customer_phone}</p>
                        </div>
                    )}
                    {quote.valid_until && (
                        <div>
                            <p className="text-sm text-slate-400">Valid Until</p>
                            <p className="font-medium">{formatDate(quote.valid_until)}</p>
                        </div>
                    )}
                    {quote.customer_address && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-slate-400">Address</p>
                            <p className="font-medium whitespace-pre-line">{quote.customer_address}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Line Items */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Line Items</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-sm text-slate-400 border-b border-slate-700">
                            <tr>
                                <th className="pb-3">Product</th>
                                <th className="pb-3 text-right">Unit Price</th>
                                <th className="pb-3 text-center">Quantity</th>
                                <th className="pb-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {quote.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3">
                                        <p className="font-medium text-white">{item.product_name}</p>
                                        <p className="text-sm text-slate-400">{item.product_sku}</p>
                                    </td>
                                    <td className="py-3 text-right text-slate-300">
                                        {formatCurrency(item.unit_price)}
                                    </td>
                                    <td className="py-3 text-center text-slate-300">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 text-right font-medium text-white">
                                        {formatCurrency(item.line_total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-6 border-t border-slate-700 pt-4">
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-slate-300">
                                <span>Subtotal</span>
                                <span>{formatCurrency(quote.subtotal)}</span>
                            </div>
                            {quote.discount_percent > 0 && (
                                <div className="flex justify-between text-red-400">
                                    <span>Discount ({quote.discount_percent}%)</span>
                                    <span>-{formatCurrency(quote.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-white border-t border-slate-700 pt-2">
                                <span>Total</span>
                                <span className="text-brand-400">{formatCurrency(quote.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {quote.notes && (
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
                    <p className="text-slate-300 whitespace-pre-line">{quote.notes}</p>
                </div>
            )}

            {/* Status Update Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title="Update Quote Status"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Status
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsStatusModalOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button onClick={handleStatusUpdate} className="btn btn-primary">
                            Update Status
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Quote"
                message="Are you sure you want to delete this quote? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleting}
            />

            {/* Convert to Order Confirmation Modal */}
            <ConfirmModal
                isOpen={convertModalOpen}
                onClose={() => setConvertModalOpen(false)}
                onConfirm={handleConvertToOrder}
                title="Convert to Order"
                message="Are you sure you want to convert this quote to an order?"
                confirmText="Convert"
                variant="warning"
                loading={converting}
            />
        </div>
    );
}
