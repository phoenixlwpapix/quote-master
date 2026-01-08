'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import OrderProgressBar from '@/components/OrderProgressBar';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import type { Order } from '@/lib/types';

interface OrderDetailClientProps {
    order: Order;
}

export default function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
    const router = useRouter();
    const [order, setOrder] = useState<Order>(initialOrder);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>(order.status);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleStatusUpdate = async () => {
        if (newStatus === order.status) return;

        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                const updated = await res.json();
                setOrder(updated);
                setIsStatusModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
            router.push('/orders');
        } catch (error) {
            console.error('Error deleting order:', error);
        } finally {
            setDeleting(false);
            setDeleteModalOpen(false);
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
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/orders"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{order.order_number}</h1>
                            <StatusBadge status={order.status} type="order" />
                        </div>
                        <p className="text-slate-400 mt-1">Created on {formatDate(order.created_at)}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsStatusModalOpen(true)}
                        className="btn btn-secondary"
                    >
                        <Edit2 size={18} />
                        Update Status
                    </button>
                    {order.quote_id && (
                        <Link href={`/quotes/${order.quote_id}`} className="btn btn-secondary">
                            <FileText size={18} />
                            View Quote
                        </Link>
                    )}
                    <button onClick={() => setDeleteModalOpen(true)} className="btn btn-danger">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Order Progress */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Order Progress</h2>
                <OrderProgressBar
                    status={order.status}
                    createdAt={order.created_at}
                    updatedAt={order.updated_at}
                />
            </div>

            {/* Customer Info */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <div>
                        <p className="text-sm text-slate-400">Name</p>
                        <p className="font-medium">{order.customer_name}</p>
                    </div>
                    {order.customer_email && (
                        <div>
                            <p className="text-sm text-slate-400">Email</p>
                            <p className="font-medium">{order.customer_email}</p>
                        </div>
                    )}
                    {order.customer_phone && (
                        <div>
                            <p className="text-sm text-slate-400">Phone</p>
                            <p className="font-medium">{order.customer_phone}</p>
                        </div>
                    )}
                    {order.customer_address && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-slate-400">Address</p>
                            <p className="font-medium whitespace-pre-line">{order.customer_address}</p>
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
                            {order.items?.map((item, index) => (
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
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discount_percent > 0 && (
                                <div className="flex justify-between text-red-400">
                                    <span>Discount ({order.discount_percent}%)</span>
                                    <span>-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-white border-t border-slate-700 pt-2">
                                <span>Total</span>
                                <span className="text-brand-400">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
                    <p className="text-slate-300 whitespace-pre-line">{order.notes}</p>
                </div>
            )}

            {/* Status Update Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title="Update Order Status"
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
                title="Delete Order"
                message="Are you sure you want to delete this order? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}
