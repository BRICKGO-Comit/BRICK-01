'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}
