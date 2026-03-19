'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, RefreshCw, Server, Cpu } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { PageSkeleton } from '@/components/Skeleton';
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-queries';
import type { Product, Category } from '@/lib/types';

type ProductType = 'solution' | 'oem_kit';

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    solution: 'Solution',
    oem_kit: 'OEM Kit',
};

const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
    solution: 'Rack + Analysis Module + Software',
    oem_kit: 'Motherboard + Analysis Module + Software',
};

function ProductTypeBadge({ type }: { type: ProductType }) {
    if (type === 'oem_kit') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400">
                <Cpu size={11} />
                OEM Kit
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand-500/15 text-brand-400">
            <Server size={11} />
            Solution
        </span>
    );
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filterType, setFilterType] = useState<string>('');
    const [newCategory, setNewCategory] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        product_type: 'solution' as ProductType,
        sku: '',
        name: '',
        description: '',
        unit_price: '',
        category_id: '',
    });

    const { data: products = [], isLoading: productsLoading, isFetching: productsFetching, refetch: refetchProducts } = useProducts();
    const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();

    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    const isLoading = productsLoading || categoriesLoading;

    const filteredProducts = filterType
        ? products.filter((p) => p.product_type === filterType)
        : products;

    const solutionCount = products.filter((p) => p.product_type === 'solution').length;
    const oemKitCount = products.filter((p) => p.product_type === 'oem_kit').length;

    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setIsModalOpen(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            ...formData,
            unit_price: parseFloat(formData.unit_price),
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
        };

        try {
            if (editingProduct) {
                await updateProductMutation.mutateAsync({ id: editingProduct.id, data: productData });
            } else {
                await createProductMutation.mutateAsync(productData);
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            product_type: (product.product_type as ProductType) ?? 'solution',
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            unit_price: String(product.unit_price),
            category_id: product.category_id ? String(product.category_id) : '',
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
            await deleteProductMutation.mutateAsync(deletingId);
        } catch (error) {
            console.error('Error deleting product:', error);
        } finally {
            setDeleteModalOpen(false);
            setDeletingId(null);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory.trim() }),
            });
            setNewCategory('');
            refetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            product_type: 'solution',
            sku: '',
            name: '',
            description: '',
            unit_price: '',
            category_id: '',
        });
    };

    const openNewModal = () => {
        setEditingProduct(null);
        resetForm();
        setIsModalOpen(true);
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const columns = [
        {
            key: 'product_type',
            label: 'Type',
            sortable: true,
            render: (product: Product) => (
                <ProductTypeBadge type={(product.product_type as ProductType) ?? 'solution'} />
            ),
        },
        { key: 'sku', label: 'Model No.', sortable: true },
        { key: 'name', label: 'Product Name', sortable: true },
        {
            key: 'category_name',
            label: 'Series',
            sortable: true,
            render: (product: Product) =>
                product.category_name ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                        {product.category_name}
                    </span>
                ) : (
                    <span className="text-slate-600">—</span>
                ),
        },
        {
            key: 'unit_price',
            label: 'List Price',
            sortable: true,
            render: (product: Product) => (
                <span className="font-mono text-slate-200">{formatCurrency(product.unit_price)}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (product: Product) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => openDeleteModal(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const isSaving = createProductMutation.isPending || updateProductMutation.isPending;

    if (isLoading) return <PageSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products</h1>
                    <p className="text-slate-400 mt-1">Manage solutions & OEM kits</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetchProducts()}
                        disabled={productsFetching}
                        className="btn btn-ghost"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={productsFetching ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary">
                        <Tag size={18} />
                        Series
                    </button>
                    <button onClick={openNewModal} className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setFilterType('')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterType === ''
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    All
                    <span className="ml-1.5 text-xs opacity-70">{products.length}</span>
                </button>
                <button
                    onClick={() => setFilterType(filterType === 'solution' ? '' : 'solution')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterType === 'solution'
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    <Server size={13} />
                    Solutions
                    <span className="text-xs opacity-70">{solutionCount}</span>
                </button>
                <button
                    onClick={() => setFilterType(filterType === 'oem_kit' ? '' : 'oem_kit')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterType === 'oem_kit'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    <Cpu size={13} />
                    OEM Kits
                    <span className="text-xs opacity-70">{oemKitCount}</span>
                </button>
                {productsFetching && <span className="text-slate-400 text-sm ml-2">Updating...</span>}
            </div>

            {/* Products Table */}
            <DataTable
                data={filteredProducts}
                columns={columns}
                searchable
                searchPlaceholder="Search by model no. or name..."
                emptyMessage="No products found. Add your first solution or OEM kit to get started."
            />

            {/* Product Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Product Type *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['solution', 'oem_kit'] as ProductType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, product_type: type })}
                                    className={`flex flex-col items-start gap-0.5 p-3 rounded-lg border text-left transition-all ${formData.product_type === type
                                        ? type === 'solution'
                                            ? 'border-brand-500 bg-brand-500/10'
                                            : 'border-amber-500 bg-amber-500/10'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${formData.product_type === type
                                        ? type === 'solution' ? 'text-brand-400' : 'text-amber-400'
                                        : 'text-slate-300'
                                        }`}>
                                        {PRODUCT_TYPE_LABELS[type]}
                                    </span>
                                    <span className="text-xs text-slate-500">{PRODUCT_TYPE_DESCRIPTIONS[type]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Model No. *
                            </label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                required
                                className="w-full"
                                placeholder="e.g., AS-2000-PRO"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Series
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full"
                            >
                                <option value="">— None —</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full"
                            placeholder="e.g., Advanced Analytics System 2000 Pro"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Components / Specs
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full"
                            placeholder={formData.product_type === 'solution'
                                ? 'e.g., 4U Rack × 1, Model X Analysis Module × 2, Analytics Suite v3 License × 1'
                                : 'e.g., ATX Motherboard × 1, Model X Analysis Module × 2, Analytics Suite OEM License × 1'
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            List Price (USD) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.unit_price}
                            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                            required
                            className="w-full"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')} Product
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Series Modal */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Manage Product Series"
                size="sm"
            >
                <div className="space-y-4">
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New series name (e.g., Pro Series)"
                            className="flex-1"
                        />
                        <button type="submit" className="btn btn-primary">Add</button>
                    </form>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                                <span className="text-white">{cat.name}</span>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-4">No series yet</p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleteProductMutation.isPending}
            />
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ProductsContent />
        </Suspense>
    );
}
