'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Mail, Phone, RefreshCw } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { PageSkeleton } from '@/components/Skeleton';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/use-queries';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        notes: '',
    });

    // 使用 React Query 进行数据管理，缓存在 5 分钟内有效
    const { data: customers = [], isLoading, isFetching, refetch } = useCustomers();
    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();
    const deleteCustomerMutation = useDeleteCustomer();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCustomer) {
                await updateCustomerMutation.mutateAsync({ id: editingCustomer.id, data: formData });
            } else {
                await createCustomerMutation.mutateAsync(formData);
            }

            setIsModalOpen(false);
            setEditingCustomer(null);
            resetForm();
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            address: customer.address || '',
            notes: customer.notes || '',
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (id: number) => {
        setDeletingId(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            await deleteCustomerMutation.mutateAsync(deletingId);
        } catch (error) {
            console.error('Error deleting customer:', error);
        } finally {
            setDeleteModalOpen(false);
            setDeletingId(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            address: '',
            notes: '',
        });
    };

    const openNewModal = () => {
        setEditingCustomer(null);
        resetForm();
        setIsModalOpen(true);
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (customer: Customer) => (
                <div>
                    <p className="font-medium text-white">{customer.name}</p>
                    {customer.company && (
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                            <Building2 size={12} />
                            {customer.company}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Contact',
            render: (customer: Customer) => (
                <div className="space-y-1">
                    {customer.email && (
                        <p className="text-sm flex items-center gap-1 text-slate-300">
                            <Mail size={12} className="text-slate-400" />
                            {customer.email}
                        </p>
                    )}
                    {customer.phone && (
                        <p className="text-sm flex items-center gap-1 text-slate-300">
                            <Phone size={12} className="text-slate-400" />
                            {customer.phone}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'address',
            label: 'Address',
            render: (customer: Customer) => (
                <span className="text-slate-400 text-sm">
                    {customer.address ? (
                        customer.address.length > 40
                            ? customer.address.substring(0, 40) + '...'
                            : customer.address
                    ) : '-'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (customer: Customer) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleEdit(customer)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => openDeleteModal(customer.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const isSaving = createCustomerMutation.isPending || updateCustomerMutation.isPending;

    // 显示骨架屏直到数据加载完成
    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Customers</h1>
                    <p className="text-slate-400 mt-1">Manage your customer database</p>
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
                    <button onClick={openNewModal} className="btn btn-primary">
                        <Plus size={18} />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Fetching indicator */}
            {isFetching && !isLoading && (
                <div className="text-slate-400 text-sm">Updating...</div>
            )}

            {/* Customers Table */}
            <DataTable
                data={customers}
                columns={columns}
                searchable
                searchPlaceholder="Search customers..."
                emptyMessage="No customers found. Add your first customer to get started."
            />

            {/* Customer Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full"
                                placeholder="Customer name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Company
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full"
                                placeholder="Company name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={2}
                            className="w-full"
                            placeholder="Full address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full"
                            placeholder="Optional notes about the customer"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingCustomer ? 'Update' : 'Create')} Customer
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleteCustomerMutation.isPending}
            />
        </div>
    );
}
