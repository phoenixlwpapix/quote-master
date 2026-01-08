'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, ArrowLeft, User, GripVertical } from 'lucide-react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import Link from 'next/link';
import type { Product, Customer } from '@/lib/types';

interface LineItem {
    product_id: number;
    product_name: string;
    product_sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export default function NewQuotePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(false);

    // Customer search state
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        discount_percent: 0,
        notes: '',
        valid_until: '',
    });

    const [lineItems, setLineItems] = useState<LineItem[]>([]);

    // Drag and drop for reordering line items
    const { getDragProps, getRowClassName } = useDragAndDrop({
        items: lineItems,
        onReorder: setLineItems,
        getItemId: (item) => item.product_id,
    });

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        const results = products.filter(p =>
            p.name.toLowerCase().includes(term.toLowerCase()) ||
            p.sku.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(results);
    }, [products]);

    const handleCustomerSearch = useCallback((term: string) => {
        setCustomerSearchTerm(term);
        if (term.length < 1) {
            setCustomerSearchResults([]);
            return;
        }

        const results = customers.filter(c =>
            c.name.toLowerCase().includes(term.toLowerCase()) ||
            (c.company && c.company.toLowerCase().includes(term.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(term.toLowerCase()))
        );
        setCustomerSearchResults(results);
    }, [customers]);

    const selectCustomer = (customer: Customer) => {
        setFormData({
            ...formData,
            customer_name: customer.name,
            customer_email: customer.email || '',
            customer_phone: customer.phone || '',
            customer_address: customer.address || '',
        });
        setCustomerSearchTerm('');
        setCustomerSearchResults([]);
        setShowCustomerSearch(false);
    };

    const addLineItem = (product: Product) => {
        // Check if product is already in the list
        const existing = lineItems.find(item => item.product_id === product.id);
        if (existing) {
            setLineItems(lineItems.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1, line_total: item.unit_price * (item.quantity + 1) }
                    : item
            ));
        } else {
            setLineItems([...lineItems, {
                product_id: product.id,
                product_name: product.name,
                product_sku: product.sku,
                unit_price: product.unit_price,
                quantity: 1,
                line_total: product.unit_price,
            }]);
        }

        setSearchTerm('');
        setSearchResults([]);
        setShowSearch(false);
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) return;
        setLineItems(lineItems.map(item =>
            item.product_id === productId
                ? { ...item, quantity, line_total: item.unit_price * quantity }
                : item
        ));
    };

    const removeLineItem = (productId: number) => {
        setLineItems(lineItems.filter(item => item.product_id !== productId));
    };

    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => sum + item.line_total, 0);
    };

    const calculateDiscount = () => {
        return calculateSubtotal() * (formData.discount_percent / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lineItems.length === 0) {
            alert('Please add at least one product to the quote.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items: lineItems.map(({ product_id, product_name, product_sku, unit_price, quantity }) => ({
                        product_id,
                        product_name,
                        product_sku,
                        unit_price,
                        quantity,
                    })),
                }),
            });

            if (res.ok) {
                const quote = await res.json();
                router.push(`/quotes/${quote.id}`);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to create quote');
            }
        } catch (error) {
            console.error('Error creating quote:', error);
            alert('Failed to create quote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/quotes"
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">New Quote</h1>
                    <p className="text-slate-400 mt-1">Create a new quote for a customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>

                    {/* Quick Customer Selection */}
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <label className="block text-sm font-medium text-brand-400 mb-2">
                            <User size={14} className="inline mr-1.5" />
                            Quick Select Existing Customer
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={customerSearchTerm}
                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                onFocus={() => setShowCustomerSearch(true)}
                                placeholder="Type to search customers by name, company, or email..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                                style={{ paddingLeft: '2.75rem' }}
                            />

                            {/* Customer List Dropdown */}
                            {showCustomerSearch && (
                                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-72 overflow-y-auto">
                                    {customers.length === 0 ? (
                                        <div className="px-4 py-3 text-slate-400 text-sm text-center">
                                            No customers found. Add customers in the Customers page.
                                        </div>
                                    ) : customerSearchTerm.length === 0 ? (
                                        <>
                                            <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-800/80 sticky top-0">
                                                All Customers ({customers.length})
                                            </div>
                                            {customers.map((customer) => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    onClick={() => selectCustomer(customer)}
                                                    className="w-full text-left px-4 py-3 hover:bg-brand-600/20 border-b border-slate-700/50 last:border-0 transition-colors"
                                                >
                                                    <p className="text-white font-medium">{customer.name}</p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-400">
                                                        {customer.company && <span className="text-slate-500">{customer.company}</span>}
                                                        {customer.email && <span>{customer.email}</span>}
                                                        {customer.phone && <span>{customer.phone}</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    ) : customerSearchResults.length > 0 ? (
                                        <>
                                            <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-800/80 sticky top-0">
                                                Search Results ({customerSearchResults.length})
                                            </div>
                                            {customerSearchResults.map((customer) => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    onClick={() => selectCustomer(customer)}
                                                    className="w-full text-left px-4 py-3 hover:bg-brand-600/20 border-b border-slate-700/50 last:border-0 transition-colors"
                                                >
                                                    <p className="text-white font-medium">{customer.name}</p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-400">
                                                        {customer.company && <span className="text-slate-500">{customer.company}</span>}
                                                        {customer.email && <span>{customer.email}</span>}
                                                        {customer.phone && <span>{customer.phone}</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="px-4 py-3 text-slate-400 text-sm text-center">
                                            No customers match &quot;{customerSearchTerm}&quot;
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Select a customer to auto-fill their details, or enter manually below</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                required
                                className="w-full"
                                placeholder="Customer or company name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.customer_email}
                                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                className="w-full"
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.customer_phone}
                                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                className="w-full"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Valid Until
                            </label>
                            <input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                className="w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Address
                            </label>
                            <textarea
                                value={formData.customer_address}
                                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                rows={2}
                                className="w-full"
                                placeholder="Billing address"
                            />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4">Line Items</h2>

                    {/* Product Catalog */}
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-brand-400">
                                <Plus size={14} className="inline mr-1.5" />
                                Add Products from Catalog
                            </label>
                            <span className="text-xs text-slate-500">{products.length} products available</span>
                        </div>

                        {/* Search Filter */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Filter products by name or SKU..."
                                className="w-full pl-11 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                                style={{ paddingLeft: '2.75rem' }}
                            />
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                            {(searchTerm.length >= 2 ? searchResults : products).map((product) => {
                                const isAdded = lineItems.some(item => item.product_id === product.id);
                                const currentQty = lineItems.find(item => item.product_id === product.id)?.quantity || 0;

                                return (
                                    <div
                                        key={product.id}
                                        className={`relative p-3 rounded-lg border transition-all ${isAdded
                                            ? 'bg-brand-900/30 border-brand-600/50'
                                            : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-white font-medium text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-slate-500">{product.sku}</p>
                                            </div>
                                            <span className="text-brand-400 font-semibold text-sm whitespace-nowrap">
                                                {formatCurrency(product.unit_price)}
                                            </span>
                                        </div>

                                        {isAdded ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-brand-400">Added ({currentQty}x)</span>
                                                <button
                                                    type="button"
                                                    onClick={() => addLineItem(product)}
                                                    className="px-2 py-1 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded transition-colors"
                                                >
                                                    + Add More
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => addLineItem(product)}
                                                className="w-full py-1.5 text-xs bg-slate-700 hover:bg-brand-600 text-white rounded transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Plus size={14} />
                                                Add to Quote
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {searchTerm.length >= 2 && searchResults.length === 0 && (
                                <div className="col-span-full text-center py-4 text-slate-400 text-sm">
                                    No products match &quot;{searchTerm}&quot;
                                </div>
                            )}

                            {products.length === 0 && (
                                <div className="col-span-full text-center py-4 text-slate-400 text-sm">
                                    No products available. Add products in the Products page.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line Items Table */}
                    {lineItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No items added yet. Click "Add Product" to start.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="text-left text-sm text-slate-400 border-b border-slate-700">
                                    <tr>
                                        <th className="pb-3 w-8"></th>
                                        <th className="pb-3">Product</th>
                                        <th className="pb-3 text-right">Unit Price</th>
                                        <th className="pb-3 text-center">Quantity</th>
                                        <th className="pb-3 text-right">Total</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {lineItems.map((item, index) => (
                                        <tr
                                            key={item.product_id}
                                            {...getDragProps(index)}
                                            className={getRowClassName(index, 'cursor-move transition-all')}
                                        >
                                            <td className="py-3 w-8">
                                                <div className="flex items-center justify-center text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
                                                    <GripVertical size={18} />
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <p className="font-medium text-white">{item.product_name}</p>
                                                <p className="text-sm text-slate-400">{item.product_sku}</p>
                                            </td>
                                            <td className="py-3 text-right text-slate-300">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                        className="w-8 h-8 rounded bg-slate-700 text-white hover:bg-slate-600"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                                                        className="w-16 text-center bg-slate-800 border border-slate-600 rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded bg-slate-700 text-white hover:bg-slate-600"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right font-medium text-white">
                                                {formatCurrency(item.line_total)}
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLineItem(item.product_id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                                className="w-full"
                                placeholder="Additional notes for the quote..."
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-300">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Discount (%)</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.discount_percent}
                                    onChange={(e) => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) || 0 })}
                                    className="w-24 text-right"
                                />
                            </div>
                            {formData.discount_percent > 0 && (
                                <div className="flex justify-between text-red-400">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(calculateDiscount())}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-700 pt-3">
                                <div className="flex justify-between text-white text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-brand-400">{formatCurrency(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/quotes" className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Quote'}
                    </button>
                </div>
            </form>
        </div>
    );
}
