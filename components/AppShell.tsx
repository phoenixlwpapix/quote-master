'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { UserButton } from '@neondatabase/auth/react';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-30 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-3 font-bold text-brand-400">
                        QuoteMaster
                    </span>
                </div>
                <UserButton size="sm" />
            </div>

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <main
                className={`
                    transition-all duration-300 ease-in-out min-h-screen 
                    pt-20 md:pt-6 p-4 md:p-6
                    ${collapsed ? 'md:ml-16' : 'md:ml-64'}
                `}
            >
                {children}
            </main>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
}
