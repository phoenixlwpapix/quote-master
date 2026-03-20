'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronRight } from 'lucide-react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    expandRender?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends { id: number | string }>({
    data,
    columns,
    onRowClick,
    searchable = false,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data found',
    expandRender,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<number | string>>(new Set());

    const toggleExpand = (id: number | string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const filteredData = searchable && search
        ? data.filter(item =>
            Object.values(item as object).some(val =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
        )
        : data;

    const sortedData = sortKey
        ? [...filteredData].sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[sortKey];
            const bVal = (b as Record<string, unknown>)[sortKey];
            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return sortDir === 'asc' ? comparison : -comparison;
        })
        : filteredData;

    return (
        <div className="space-y-4">
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                        style={{ paddingLeft: '2.75rem' }}
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-800/80">
                        <tr>
                            {expandRender && <th className="px-2 py-3 w-8" />}
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={`px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-white select-none' : ''
                                        }`}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === String(col.key) && (
                                            sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (expandRender ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item) => {
                                const isExpanded = expandedIds.has(item.id);
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr
                                            className={`bg-slate-800/40 hover:bg-slate-700/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                            onClick={() => onRowClick?.(item)}
                                        >
                                            {expandRender && (
                                                <td className="px-2 py-3 w-8">
                                                    <button
                                                        onClick={(e) => toggleExpand(item.id, e)}
                                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                                    >
                                                        <ChevronRight
                                                            size={16}
                                                            className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                                                        />
                                                    </button>
                                                </td>
                                            )}
                                            {columns.map((col) => (
                                                <td key={String(col.key)} className="px-4 py-3 text-sm text-slate-200">
                                                    {col.render
                                                        ? col.render(item)
                                                        : String((item as Record<string, unknown>)[String(col.key)] ?? '-')}
                                                </td>
                                            ))}
                                        </tr>
                                        {expandRender && isExpanded && (
                                            <tr className="bg-slate-800/20">
                                                <td />
                                                <td colSpan={columns.length} className="px-4 pb-4 pt-2">
                                                    {expandRender(item)}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
