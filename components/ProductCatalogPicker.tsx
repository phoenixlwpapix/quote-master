'use client';

import { useMemo, useState } from 'react';
import { Code2, Cpu, Package, Plus, Search, Server } from 'lucide-react';
import type { Product, ProductType } from '@/lib/types';

type ProductTypeFilter = ProductType | 'all';

interface SelectedCatalogItem {
    product_id: number;
    quantity: number;
}

interface ProductCatalogPickerProps {
    products: Product[];
    selectedItems: SelectedCatalogItem[];
    onAddProduct: (product: Product) => void;
    onQuickAddProduct: () => void;
    formatCurrency: (value: number) => string;
}

const PRODUCT_TYPES: Array<{
    value: ProductTypeFilter;
    label: string;
    description: string;
    icon: typeof Server;
    activeClassName: string;
    iconClassName: string;
}> = [
    {
        value: 'solution',
        label: 'Solutions',
        description: 'Full systems',
        icon: Server,
        activeClassName: 'border-brand-500 bg-brand-500/10 text-brand-300',
        iconClassName: 'text-brand-400',
    },
    {
        value: 'oem_kit',
        label: 'OEM Kits',
        description: 'Modules and boards',
        icon: Cpu,
        activeClassName: 'border-amber-500 bg-amber-500/10 text-amber-300',
        iconClassName: 'text-amber-400',
    },
    {
        value: 'accessories',
        label: 'Accessories',
        description: 'Parts and spares',
        icon: Package,
        activeClassName: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
        iconClassName: 'text-emerald-400',
    },
    {
        value: 'software',
        label: 'Software',
        description: 'Licenses and seats',
        icon: Code2,
        activeClassName: 'border-violet-500 bg-violet-500/10 text-violet-300',
        iconClassName: 'text-violet-400',
    },
    {
        value: 'all',
        label: 'All',
        description: 'Every product',
        icon: Search,
        activeClassName: 'border-slate-400 bg-slate-500/10 text-slate-200',
        iconClassName: 'text-slate-300',
    },
];

export default function ProductCatalogPicker({
    products,
    selectedItems,
    onAddProduct,
    onQuickAddProduct,
    formatCurrency,
}: ProductCatalogPickerProps) {
    const [selectedType, setSelectedType] = useState<ProductTypeFilter>('solution');
    const [searchTerm, setSearchTerm] = useState('');

    const typeCounts = useMemo(() => {
        return PRODUCT_TYPES.reduce<Record<ProductTypeFilter, number>>((counts, type) => {
            counts[type.value] = type.value === 'all'
                ? products.length
                : products.filter((product) => product.product_type === type.value).length;
            return counts;
        }, {
            all: 0,
            solution: 0,
            oem_kit: 0,
            accessories: 0,
            software: 0,
        });
    }, [products]);

    const selectedConfig = PRODUCT_TYPES.find((type) => type.value === selectedType) ?? PRODUCT_TYPES[0];
    const productsByType = selectedType === 'all'
        ? products
        : products.filter((product) => product.product_type === selectedType);
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleProducts = normalizedSearch
        ? productsByType.filter((product) =>
            product.name.toLowerCase().includes(normalizedSearch) ||
            product.sku.toLowerCase().includes(normalizedSearch)
        )
        : productsByType;

    const selectedMap = useMemo(() => {
        return new Map(selectedItems.map((item) => [item.product_id, item.quantity]));
    }, [selectedItems]);

    return (
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-700/60 bg-slate-800/50">
            <div className="flex flex-col gap-3 border-b border-slate-700/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-brand-400">Add Products from Catalog</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{products.length} products available</p>
                </div>
                <button
                    type="button"
                    onClick={onQuickAddProduct}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-brand-600 hover:text-white"
                >
                    <Plus size={13} />
                    New Product
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="border-b border-slate-700/60 p-3 lg:border-b-0 lg:border-r">
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                        {PRODUCT_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isActive = selectedType === type.value;
                            const count = typeCounts[type.value];

                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedType(type.value);
                                        setSearchTerm('');
                                    }}
                                    className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                                        isActive
                                            ? type.activeClassName
                                            : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                    }`}
                                >
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-950/50 ${type.iconClassName}`}>
                                        <Icon size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-medium">{type.label}</span>
                                            <span className="shrink-0 text-xs text-slate-500">{count}</span>
                                        </span>
                                        <span className="mt-0.5 block truncate text-xs text-slate-500">{type.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4">
                    <div className="mb-4 flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">{selectedConfig.label}</p>
                            <p className="text-xs text-slate-500">{visibleProducts.length} shown in this type</p>
                        </div>
                        <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 transition-colors focus-within:border-brand-500 md:w-80">
                            <Search className="shrink-0 text-slate-500" size={16} />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={`Search ${selectedConfig.label.toLowerCase()}...`}
                                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                            />
                        </label>
                    </div>

                    {visibleProducts.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center text-sm text-slate-400">
                            {productsByType.length === 0
                                ? `No ${selectedConfig.label.toLowerCase()} yet.`
                                : `No ${selectedConfig.label.toLowerCase()} match "${searchTerm}".`}
                        </div>
                    ) : (
                        <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
                            {visibleProducts.map((product) => {
                                const currentQty = selectedMap.get(product.id) ?? 0;
                                const isAdded = currentQty > 0;

                                return (
                                    <div
                                        key={product.id}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            isAdded
                                                ? 'border-brand-600/60 bg-brand-950/30'
                                                : 'border-slate-700/70 bg-slate-900/50 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">{product.name}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">{product.sku}</p>
                                            </div>
                                            <span className="shrink-0 text-sm font-semibold text-brand-400">
                                                {formatCurrency(product.unit_price)}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <span className={isAdded ? 'text-xs text-brand-400' : 'text-xs text-slate-500'}>
                                                {isAdded ? `Added ${currentQty}x` : selectedConfig.label}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onAddProduct(product)}
                                                className={isAdded
                                                    ? 'inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-500'
                                                    : 'inline-flex items-center gap-1 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600'}
                                            >
                                                <Plus size={13} />
                                                {isAdded ? 'Add More' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
