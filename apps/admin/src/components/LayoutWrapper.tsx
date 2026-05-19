'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Menu, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { useDepartment } from '@/context/DepartmentContext';
import { supabase } from '@/lib/supabase';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const { department, setDepartment } = useDepartment();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Profile state
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (isLoginPage) return;

        async function loadUserProfile() {
            try {
                setLoadingProfile(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (!error && data) {
                        setProfile(data);

                        // If user is a regular admin, restrict their department state to their assigned department
                        if (data.role !== 'super_admin' && data.department) {
                            setDepartment(data.department);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading user profile in layout:", err);
            } finally {
                setLoadingProfile(false);
            }
        }

        loadUserProfile();
    }, [isLoginPage]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    const isSuperAdmin = profile?.role === 'super_admin';

    // Generate Initials
    const initials = profile 
        ? (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '') || (profile.email?.[0] || 'A').toUpperCase()
        : 'SA';

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

                    {/* Department Selector & Profile Block */}
                    <div className="flex items-center space-x-4">
                        {loadingProfile ? (
                            <div className="flex items-center space-x-2 bg-[#F1F5F9] px-4 py-2 rounded-xl text-xs text-[#64748B] font-bold">
                                <Loader2 size={12} className="animate-spin text-indigo-500" />
                                <span>CHARGEMENT...</span>
                            </div>
                        ) : (
                            <div className="relative group flex items-center">
                                {isSuperAdmin ? (
                                    <>
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
                                    </>
                                ) : (
                                    <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-xl space-x-2">
                                        <Lock size={12} className="text-indigo-500" />
                                        <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                                            {profile?.department === 'brick_food' ? '🍔 Brick Food' : '🏢 Brick Core'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="hidden sm:flex items-center space-x-3 border-l border-[#E2E8F0] pl-6 ml-2">
                            {loadingProfile ? (
                                <div className="text-right space-y-1">
                                    <div className="h-3 w-20 bg-slate-100 animate-pulse rounded"></div>
                                    <div className="h-2 w-32 bg-slate-100 animate-pulse rounded"></div>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <p className="text-xs font-bold text-[#0F172A]">
                                        {profile?.first_name || profile?.last_name
                                            ? `${profile.first_name || ''} ${profile.last_name || ''}`
                                            : (isSuperAdmin ? 'Super Admin' : 'Admin')}
                                    </p>
                                    <p className="text-[10px] text-[#64748B] font-medium max-w-[150px] truncate">{profile?.email || 'N/A'}</p>
                                </div>
                            )}
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 uppercase text-sm">
                                {initials}
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
