'use client';

import { useState, useEffect } from 'react';
import { Server, Cpu, Package, Code2 } from 'lucide-react';
import Modal from './Modal';
import type { Product, ProductType } from '@/lib/types';

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    solution: 'Solution',
    oem_kit: 'OEM Kit',
    accessories: 'Accessories',
    software: 'Software',
};

const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
    solution: 'Rack + Analysis Module + Software',
    oem_kit: 'Motherboard + Analysis Module + Software',
    accessories: 'Hardware accessories & spare parts',
    software: 'Software licenses & subscriptions',
};

const COLOR_MAP: Record<ProductType, { active: string; text: string }> = {
    solution: { active: 'border-brand-500 bg-brand-500/10', text: 'text-brand-400' },
    oem_kit: { active: 'border-amber-500 bg-amber-500/10', text: 'text-amber-400' },
    accessories: { active: 'border-emerald-500 bg-emerald-500/10', text: 'text-emerald-400' },
    software: { active: 'border-violet-500 bg-violet-500/10', text: 'text-violet-400' },
};

interface Category {
    id: number;
    name: string;
}

interface QuickAddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductCreated: (product: Product) => void;
}

export default function QuickAddProductModal({ isOpen, onClose, onProductCreated }: QuickAddProductModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        product_type: 'solution' as ProductType,
        sku: '',
        name: '',
        description: '',
        unit_price: '',
        category_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetch('/api/categories')
                .then((r) => r.json())
                .then(setCategories)
                .catch(() => {});
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({ product_type: 'solution', sku: '', name: '', description: '', unit_price: '', category_id: '' });
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    unit_price: parseFloat(formData.unit_price),
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to create product');
                return;
            }

            const product: Product = await res.json();
            resetForm();
            onProductCreated(product);
        } catch {
            setError('Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add Product" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Product Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['solution', 'oem_kit', 'accessories', 'software'] as ProductType[]).map((type) => {
                            const isActive = formData.product_type === type;
                            const icons = {
                                solution: <Server size={13} />,
                                oem_kit: <Cpu size={13} />,
                                accessories: <Package size={13} />,
                                software: <Code2 size={13} />,
                            };
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, product_type: type })}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                                        isActive ? COLOR_MAP[type].active : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                    }`}
                                >
                                    <span className={isActive ? COLOR_MAP[type].text : 'text-slate-500'}>{icons[type]}</span>
                                    <div>
                                        <p className={`text-xs font-medium ${isActive ? COLOR_MAP[type].text : 'text-slate-300'}`}>
                                            {PRODUCT_TYPE_LABELS[type]}
                                        </p>
                                        <p className="text-xs text-slate-500 leading-tight">{PRODUCT_TYPE_DESCRIPTIONS[type]}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Model No. *</label>
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
                        <label className="block text-sm font-medium text-slate-300 mb-1">Series</label>
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
                    <label className="block text-sm font-medium text-slate-300 mb-1">Product Name *</label>
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
                    <label className="block text-sm font-medium text-slate-300 mb-1">Components / Specs</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full"
                        placeholder={
                            formData.product_type === 'solution'
                                ? 'e.g., 4U Rack × 1, Analysis Module × 2, Software License × 1'
                                : formData.product_type === 'oem_kit'
                                ? 'e.g., ATX Motherboard × 1, Analysis Module × 2, OEM License × 1'
                                : formData.product_type === 'accessories'
                                ? 'e.g., Mounting bracket, cable kit, spare sensors'
                                : 'e.g., Annual subscription license, number of seats'
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">List Price (USD) *</label>
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

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={handleClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Creating...' : 'Create & Add to Quote'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
