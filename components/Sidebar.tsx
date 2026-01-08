'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    FileText,
    ShoppingCart,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { UserButton } from '@neondatabase/auth/react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/quotes', label: 'Quotes', icon: FileText },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (value: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 text-white transition-all duration-300 z-50
                ${collapsed ? 'w-16' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
                    {!collapsed && (
                        <h1 className="text-lg font-bold text-brand-400">
                            QuoteMaster
                        </h1>
                    )}
                </div>

                {/* Desktop Collapse Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:block p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                        ${isActive
                                            ? 'bg-brand-500/10 text-brand-400'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }
                                        ${collapsed ? 'justify-center' : ''}
                                    `}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon
                                        size={20}
                                        className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-400' : ''}`}
                                    />
                                    {!collapsed && (
                                        <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer with User Profile */}
            <div className={`absolute bottom-4 left-3 right-3 ${collapsed ? 'flex justify-center' : ''}`}>
                <UserButton
                    size={collapsed ? "icon" : "default"}
                    className="w-full"
                />
            </div>
        </aside>
    );
}
