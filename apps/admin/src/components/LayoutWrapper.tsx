'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
