'use client';

import { useState } from 'react';
import {
    Plus, Edit2, Trash2, Globe, MapPin, RefreshCw,
    ChevronDown, ChevronRight, User, Star, Phone, Mail, Briefcase
} from 'lucide-react';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { PageSkeleton } from '@/components/Skeleton';
import {
    useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
    useContacts, useCreateContact, useUpdateContact, useDeleteContact,
} from '@/hooks/use-queries';
import type { Customer, Contact } from '@/lib/types';

// ─── Contact row component ─────────────────────────────────────────────────
function ContactRow({
    contact,
    customerId,
    onEdit,
    onDelete,
}: {
    contact: Contact;
    customerId: number;
    onEdit: (c: Contact) => void;
    onDelete: (id: number) => void;
}) {
    const deleteContact = useDeleteContact(customerId);

    return (
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/40 group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{contact.name}</span>
                    {contact.is_primary && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-400">
                            <Star size={10} fill="currentColor" /> Primary
                        </span>
                    )}
                    {contact.title && (
                        <span className="text-xs text-slate-400">{contact.title}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                    {contact.email && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={10} />{contact.email}
                        </span>
                    )}
                    {contact.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone size={10} />{contact.phone}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(contact)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                >
                    <Edit2 size={13} />
                </button>
                <button
                    onClick={() => onDelete(contact.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors"
                    disabled={deleteContact.isPending}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// ─── Expanded contacts panel ───────────────────────────────────────────────
function ContactsPanel({ customerId }: { customerId: number }) {
    const { data: contacts = [], isLoading } = useContacts(customerId);
    const createContact = useCreateContact(customerId);
    const updateContact = useUpdateContact(customerId);
    const deleteContact = useDeleteContact(customerId);

    const [isAdding, setIsAdding] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const emptyForm = { name: '', title: '', email: '', phone: '', is_primary: false, notes: '' };
    const [form, setForm] = useState(emptyForm);

    const openAdd = () => { setForm(emptyForm); setEditingContact(null); setIsAdding(true); };
    const openEdit = (c: Contact) => {
        setForm({ name: c.name, title: c.title ?? '', email: c.email ?? '', phone: c.phone ?? '', is_primary: c.is_primary, notes: c.notes ?? '' });
        setEditingContact(c);
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        if (editingContact) {
            await updateContact.mutateAsync({ contactId: editingContact.id, data: form });
        } else {
            await createContact.mutateAsync(form);
        }
        setIsAdding(false);
        setEditingContact(null);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteContact.mutateAsync(deleteId);
        setDeleteId(null);
    };

    if (isLoading) return <div className="py-3 px-3 text-slate-400 text-sm">Loading contacts...</div>;

    return (
        <div className="border-t border-slate-700/60 bg-slate-800/40">
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Contacts</span>
                    <button onClick={openAdd} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <Plus size={12} /> Add Contact
                    </button>
                </div>

                {/* Add / Edit form */}
                {isAdding && (
                    <div className="mb-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Name *"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full text-sm py-1.5 px-2"
                            />
                            <input
                                type="text"
                                placeholder="Job Title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full text-sm py-1.5 px-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full text-sm py-1.5 px-2"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full text-sm py-1.5 px-2"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_primary}
                                onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
                                className="rounded"
                            />
                            Primary contact
                        </label>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setIsAdding(false); setEditingContact(null); }} className="btn btn-secondary text-xs py-1 px-3">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={createContact.isPending || updateContact.isPending || !form.name.trim()}
                                className="btn btn-primary text-xs py-1 px-3"
                            >
                                {editingContact ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Contacts list */}
                {contacts.length === 0 && !isAdding ? (
                    <p className="text-xs text-slate-500 py-2 px-3">No contacts yet.</p>
                ) : (
                    contacts.map((c) => (
                        <ContactRow
                            key={c.id}
                            contact={c}
                            customerId={customerId}
                            onEdit={openEdit}
                            onDelete={setDeleteId}
                        />
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Contact"
                message="Remove this contact?"
                confirmText="Delete"
                variant="danger"
                loading={deleteContact.isPending}
            />
        </div>
    );
}

// ─── Company row ───────────────────────────────────────────────────────────
function CompanyRow({
    customer,
    onEdit,
    onDelete,
}: {
    customer: Customer;
    onEdit: (c: Customer) => void;
    onDelete: (id: number) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-slate-700 rounded-xl overflow-hidden mb-3 bg-slate-800">
            <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <button className="text-slate-400 shrink-0">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{customer.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                        {customer.industry && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Briefcase size={10} />{customer.industry}
                            </span>
                        )}
                        {customer.address && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin size={10} />{customer.address.length > 35 ? customer.address.slice(0, 35) + '…' : customer.address}
                            </span>
                        )}
                        {customer.website && (
                            <a
                                href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <Globe size={10} />{customer.website}
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                        <User size={12} />
                        {(customer.contacts?.length ?? 0)} contact{(customer.contacts?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => onEdit(customer)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        onClick={() => onDelete(customer.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {expanded && <ContactsPanel customerId={customer.id} />}
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function CustomersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const emptyForm = { name: '', address: '', website: '', industry: '', notes: '' };
    const [formData, setFormData] = useState(emptyForm);

    const { data: customers = [], isLoading, isFetching, refetch } = useCustomers();
    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();
    const deleteCustomerMutation = useDeleteCustomer();

    const filtered = search.trim()
        ? customers.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.industry?.toLowerCase().includes(search.toLowerCase()) ||
            c.address?.toLowerCase().includes(search.toLowerCase())
        )
        : customers;

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
            setFormData(emptyForm);
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            address: customer.address ?? '',
            website: customer.website ?? '',
            industry: customer.industry ?? '',
            notes: customer.notes ?? '',
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (id: number) => { setDeletingId(id); setDeleteModalOpen(true); };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteCustomerMutation.mutateAsync(deletingId);
        } finally {
            setDeleteModalOpen(false);
            setDeletingId(null);
        }
    };

    const isSaving = createCustomerMutation.isPending || updateCustomerMutation.isPending;

    if (isLoading) return <PageSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Customers</h1>
                    <p className="text-slate-400 mt-1">Manage companies and their contacts</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => refetch()} disabled={isFetching} className="btn btn-secondary" title="Refresh">
                        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => { setEditingCustomer(null); setFormData(emptyForm); setIsModalOpen(true); }} className="btn btn-primary">
                        <Plus size={18} /> Add Company
                    </button>
                </div>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm"
            />

            {isFetching && !isLoading && <div className="text-slate-400 text-sm">Updating...</div>}

            {/* Company list */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    {search ? 'No companies match your search.' : 'No companies yet. Add your first customer company to get started.'}
                </div>
            ) : (
                <div>
                    {filtered.map((customer) => (
                        <CompanyRow
                            key={customer.id}
                            customer={customer}
                            onEdit={handleEdit}
                            onDelete={openDeleteModal}
                        />
                    ))}
                </div>
            )}

            {/* Company Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCustomer ? 'Edit Company' : 'Add Company'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full"
                            placeholder="e.g. Acme Corporation"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Industry</label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full"
                                placeholder="e.g. Manufacturing"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Website</label>
                            <input
                                type="text"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full"
                                placeholder="www.example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={2}
                            className="w-full"
                            placeholder="Company address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full"
                            placeholder="Optional notes"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Company"
                message="Delete this company and all its contacts? This cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleteCustomerMutation.isPending}
            />
        </div>
    );
}
