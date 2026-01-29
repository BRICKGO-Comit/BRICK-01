"use client";

import {
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    BarChart3,
    Calendar,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";

export default function StatisticsPage() {
    const kpis = [
        { label: "Croissance Mensuelle", value: "+24%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", detail: "vs mois dernier" },
        { label: "Nouveaux Prospects", value: "156", icon: Users, color: "text-blue-600", bg: "bg-blue-50", detail: "cette semaine" },
        { label: "Objectif Trimestriel", value: "68%", icon: Target, color: "text-purple-600", bg: "bg-purple-50", detail: "400k / 600k €" },
        { label: "Délai de Conversion", value: "8.4j", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50", detail: "-1.2j depuis sept" },
    ];

    const topSales = [
        { name: "Jean Martin", sales: "€45,600", leads: 42, conversion: "32%" },
        { name: "Sophie Bernard", sales: "€38,200", leads: 56, conversion: "28%" },
        { name: "Marc Durand", sales: "€22,400", leads: 31, conversion: "24%" },
    ];

    const handleAction = (action: string) => {
        alert(`${action} - Bientôt disponible sur le dashboard !`);
    };

    return (
        <main className="flex-1 p-10 overflow-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Statistiques</h1>
                    <p className="text-[#64748B] mt-1 text-sm font-medium">Analysez les performances globales et l'efficacité de vos équipes.</p>
                </div>
                <div className="flex bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-sm">
                    {["Hebdo", "Mensuel", "Annuel"].map((t, i) => (
                        <button
                            key={i}
                            onClick={() => handleAction(`Vue ${t}`)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${i === 1 ? "bg-indigo-50 text-[#4F46E5]" : "text-[#64748B] hover:text-[#0F172A]"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpis.map((kpi, i) => (
                    <div
                        key={i}
                        onClick={() => handleAction(`KPI ${kpi.label}`)}
                        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                                <kpi.icon size={24} />
                            </div>
                            <ArrowUpRight size={18} className="text-[#CBD5E1]" />
                        </div>
                        <p className="text-[#64748B] text-xs font-black uppercase tracking-widest">{kpi.label}</p>
                        <div className="flex items-baseline space-x-2 mt-1">
                            <span className="text-2xl font-black text-[#0F172A]">{kpi.value}</span>
                            <span className="text-[10px] text-[#94A3B8] font-bold">{kpi.detail}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart Placeholder */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-[#0F172A]">Volume Prospect / Jour</h2>
                        <button
                            onClick={() => handleAction("Changer Période")}
                            className="flex items-center space-x-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
                        >
                            <Calendar size={14} />
                            <span>Octobre 2024</span>
                        </button>
                    </div>
                    <div className="flex items-end justify-between h-64 px-4 border-b border-[#F1F5F9]">
                        {/* Simple CSS bars for visualization */}
                        {[45, 78, 56, 92, 44, 67, 88, 52, 71, 95].map((h, i) => (
                            <div
                                key={i}
                                onClick={() => handleAction(`Détail Jour ${i + 1}`)}
                                className="w-8 bg-[#4F46E5] rounded-t-lg transition-all hover:bg-[#4338CA] relative group cursor-pointer"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {h} leads
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-1">
                        {["01", "04", "07", "10", "13", "16", "19", "22", "25", "28"].map((d, i) => (
                            <span key={i} className="text-[10px] font-bold text-[#94A3B8]">{d} Oct</span>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-[#0F172A] mb-8">Top Commerciaux</h2>
                    <div className="space-y-6">
                        {topSales.map((sales, i) => (
                            <div
                                key={i}
                                onClick={() => handleAction(`Performance de ${sales.name}`)}
                                className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] hover:border-[#4F46E5]/40 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] font-black group-hover:scale-110 transition-transform">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0F172A]">{sales.name}</h4>
                                        <p className="text-xs text-[#64748B] font-bold">{sales.leads} prospects capturés</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-indigo-600">{sales.sales}</div>
                                    <div className="text-[10px] text-[#94A3B8] font-bold">Conv. {sales.conversion}</div>
                                </div>
                                <div className="pl-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F46E5]">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => handleAction("Classement Complet")}
                        className="w-full mt-8 py-4 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-black text-[#0F172A] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        Voir le classement complet
                    </button>
                </div>
            </div>
        </main>
    );
}

