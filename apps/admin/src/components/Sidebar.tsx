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
    LogOut
} from "lucide-react";

export default function Sidebar() {
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
        <aside className="w-64 border-r border-[#E2E8F0] bg-white flex flex-col p-6 space-y-8 shadow-sm">
            <Link href="/" className="flex items-center mb-4 active:scale-95 transition-transform">
                <img src="/logo.png" alt="BRICK Logo" className="h-10 w-auto" />
            </Link>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-[#4F46E5]/10 text-[#4F46E5]"
                                : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-[#4F46E5]" : "text-[#64748B]"} />
                            <span className="font-semibold text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-[#E2E8F0]">
                <button className="flex items-center space-x-3 text-[#64748B] hover:text-red-500 transition-colors p-2 w-full group">
                    <LogOut size={20} className="group-hover:text-red-500" />
                    <span className="text-sm font-semibold">Se déconnecter</span>
                </button>
            </div>
        </aside>
    );
}
