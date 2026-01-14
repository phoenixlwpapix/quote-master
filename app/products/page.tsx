'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, RefreshCw } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { PageSkeleton } from '@/components/Skeleton';
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-queries';
import type { Product, Category } from '@/lib/types';

function ProductsContent() {
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [newCategory, setNewCategory] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        unit_price: '',
        category_id: '',
    });

    // 使用 React Query 进行数据管理，缓存在 5 分钟内有效
    const { data: products = [], isLoading: productsLoading, isFetching: productsFetching, refetch: refetchProducts } = useProducts();
    const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();

    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    const isLoading = productsLoading || categoriesLoading;

    // 根据分类过滤数据（客户端过滤）
    const filteredProducts = filterCategory
        ? products.filter((p) => p.category_id === parseInt(filterCategory))
        : products;

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const columns = [
        { key: 'sku', label: 'SKU', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        {
            key: 'category_name',
            label: 'Category',
            sortable: true,
            render: (product: Product) => (
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                    {product.category_name || 'Uncategorized'}
                </span>
            ),
        },
        {
            key: 'unit_price',
            label: 'Unit Price',
            sortable: true,
            render: (product: Product) => formatCurrency(product.unit_price),
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

    // 显示骨架屏直到数据加载完成
    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products</h1>
                    <p className="text-slate-400 mt-1">Manage your product catalog</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetchProducts()}
                        disabled={productsFetching}
                        className="btn btn-ghost"
                        title="Refresh data"
                    >
                        <RefreshCw size={18} className={productsFetching ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="btn btn-secondary"
                    >
                        <Tag size={18} />
                        Categories
                    </button>
                    <button onClick={openNewModal} className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-400 mr-1">Filter by:</span>
                <button
                    onClick={() => setFilterCategory('')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterCategory === ''
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    All Products
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(filterCategory === String(cat.id) ? '' : String(cat.id))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterCategory === String(cat.id)
                            ? 'bg-brand-500/20 text-brand-400'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
                {productsFetching && (
                    <span className="text-slate-400 text-sm ml-2">Updating...</span>
                )}
            </div>

            {/* Products Table */}
            <DataTable
                data={filteredProducts}
                columns={columns}
                searchable
                searchPlaceholder="Search products..."
                emptyMessage="No products found. Add your first product to get started."
            />

            {/* Product Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                SKU *
                            </label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                required
                                className="w-full"
                                placeholder="e.g., HW-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

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
                            placeholder="Product name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full"
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Unit Price *
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
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')} Product
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Categories Modal */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Manage Categories"
                size="sm"
            >
                <div className="space-y-4">
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                            className="flex-1"
                        />
                        <button type="submit" className="btn btn-primary">
                            Add
                        </button>
                    </form>

                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50"
                            >
                                <span className="text-white">{cat.name}</span>
                            </div>
                        ))}
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
