'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        notes: '',
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCustomer) {
                await fetch(`/api/customers/${editingCustomer.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            setIsModalOpen(false);
            setEditingCustomer(null);
            resetForm();
            fetchCustomers();
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
        setDeleting(true);

        try {
            await fetch(`/api/customers/${deletingId}`, { method: 'DELETE' });
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
        } finally {
            setDeleting(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Customers</h1>
                    <p className="text-slate-400 mt-1">Manage your customer database</p>
                </div>
                <button onClick={openNewModal} className="btn btn-primary">
                    <Plus size={18} />
                    Add Customer
                </button>
            </div>

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
                        <button type="submit" className="btn btn-primary">
                            {editingCustomer ? 'Update' : 'Create'} Customer
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
                loading={deleting}
            />
        </div>
    );
}
