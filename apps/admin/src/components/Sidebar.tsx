"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    LayoutDashboard,
    FileText,
    Briefcase,
    TrendingUp,
    Settings,
    LogOut,
    X
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: "/" },
        { icon: Users, label: "Commerciaux", href: "/users" },
        { icon: FileText, label: "Contenus", href: "/contents" },
        { icon: Briefcase, label: "Prospects", href: "/prospects" },
        { icon: TrendingUp, label: "Statistiques", href: "/stats" },
        { icon: Settings, label: "Paramètres", href: "/settings" },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-[#E2E8F0] flex flex-col p-6 space-y-8 shadow-2xl lg:shadow-sm transition-transform duration-300 ease-in-out z-50 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <Link href="/" onClick={onClose} className="flex items-center active:scale-95 transition-transform">
                        <img src="/logo.png" alt="BRICK Logo" className="h-10 w-auto" />
                    </Link>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-[#4F46E5]/10 text-[#4F46E5] shadow-sm"
                                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "text-[#4F46E5]" : "text-[#64748B]"} />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-[#E2E8F0]">
                    <button className="flex items-center space-x-3 text-[#64748B] hover:text-red-500 transition-colors p-3 w-full group rounded-xl hover:bg-red-50">
                        <LogOut size={20} className="group-hover:text-red-500" />
                        <span className="text-sm font-bold tracking-tight">Se déconnecter</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
