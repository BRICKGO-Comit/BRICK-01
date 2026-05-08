'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Menu, ChevronDown } from 'lucide-react';
import { useDepartment } from '@/context/DepartmentContext';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const { department, setDepartment } = useDepartment();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Global Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 h-20">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden lg:block">
                            <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest block mb-1">Système Brick</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-[#0F172A]">Connecté au Cluster Cloud</span>
                            </div>
                        </div>
                    </div>

                    {/* Department Selector */}
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value as any)}
                                className="appearance-none bg-[#F1F5F9] border-none pr-10 pl-4 py-2.5 rounded-xl font-bold text-sm text-[#0F172A] cursor-pointer hover:bg-[#E2E8F0] transition-all focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="all">🌐 Tous les départements</option>
                                <option value="brick_core">🏢 Brick Core</option>
                                <option value="brick_food">🍔 Brick Food</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                        </div>
                        
                        <div className="hidden sm:flex items-center space-x-3 border-l border-[#E2E8F0] pl-6 ml-2">
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#0F172A]">Super Admin</p>
                                <p className="text-[10px] text-[#64748B] font-medium">brick-master@admin.ci</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                                SA
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
