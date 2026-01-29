"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    BarChart3,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    Loader2
} from "lucide-react";

export default function StatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProspects: 0,
        newProspectsWeek: 0,
        totalRevenue: 0,
        conversionRate: 0,
        dailyLeads: [] as number[],
        topPerformers: [] as any[]
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Fetch Prospects
            const { data: prospects } = await supabase
                .from('prospects')
                .select('*');

            if (!prospects) return;

            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const newProspects = prospects.filter(p => new Date(p.created_at) > oneWeekAgo).length;
            const totalRev = prospects
                .filter(p => p.status === 'qualifié')
                .reduce((acc, p) => acc + (Number(p.deal_value) || 0), 0);

            // 2. Chart Data (Last 10 days)
            const dailyCounts = new Array(10).fill(0);
            const daysArr = [];
            for (let i = 9; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayStr = d.toISOString().split('T')[0];
                daysArr.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
                dailyCounts[9 - i] = prospects.filter(p => p.created_at.startsWith(dayStr)).length;
            }

            // 3. Top Performers
            const { data: performers } = await supabase
                .from('prospects')
                .select('deal_value, status, profiles(first_name, last_name)')
                .not('assigned_to', 'is', null);

            const perfMap: any = {};
            performers?.forEach((p: any) => {
                const name = `${p.profiles?.first_name || 'Inconnu'} ${p.profiles?.last_name || ''}`.trim();
                if (!perfMap[name]) perfMap[name] = { name, sales: 0, leads: 0, won: 0 };
                perfMap[name].leads++;
                if (p.status === 'qualifié') {
                    perfMap[name].sales += Number(p.deal_value) || 0;
                    perfMap[name].won++;
                }
            });

            const topPerformers = Object.values(perfMap)
                .sort((a: any, b: any) => b.sales - a.sales)
                .slice(0, 3)
                .map((p: any) => ({
                    ...p,
                    conversion: p.leads > 0 ? Math.round((p.won / p.leads) * 100) + '%' : '0%',
                    sales: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.sales)
                }));

            setStats({
                totalProspects: prospects.length,
                newProspectsWeek: newProspects,
                totalRevenue: totalRev,
                conversionRate: prospects.length > 0 ? Math.round((prospects.filter(p => p.status === 'qualifié').length / prospects.length) * 100) : 0,
                dailyLeads: dailyCounts,
                topPerformers
            });

        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const kpis = [
        { label: "Total Prospects", value: stats.totalProspects, icon: Users, color: "text-blue-600", bg: "bg-blue-50", detail: "depuis le début" },
        { label: "Nouveaux Prospects", value: stats.newProspectsWeek, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", detail: "derniers 7 jours" },
        { label: "Objectif Trimestriel", value: Math.min(100, Math.round((stats.totalRevenue / 600000) * 100)) + '%', icon: Target, color: "text-purple-600", bg: "bg-purple-50", detail: `${(stats.totalRevenue / 1000).toFixed(1)}k / 600k €` },
        { label: "Taux de Conversion", value: stats.conversionRate + '%', icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50", detail: "Statut 'Qualifié'" },
    ];

    const handleAction = (action: string) => {
        alert(`${action} - Bientôt disponible sur le dashboard !`);
    };

    return (
        <main className="p-6 lg:p-10">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:mb-10">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight">Statistiques</h1>
                    <p className="text-[#64748B] mt-1 text-sm font-medium">Analysez les performances de vos équipes.</p>
                </div>
                <div className="flex bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
                    {["Hebdo", "Mensuel", "Annuel"].map((t, i) => (
                        <button
                            key={i}
                            onClick={() => handleAction(`Vue ${t}`)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${i === 1 ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "text-[#64748B] hover:text-[#0F172A]"
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
                    <div className="flex items-end justify-between h-64 px-4 border-b border-[#F1F5F9] relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                <Loader2 className="animate-spin text-indigo-600" />
                            </div>
                        )}
                        {/* Bars for visualization */}
                        {stats.dailyLeads.map((h, i) => (
                            <div
                                key={i}
                                className="w-8 bg-[#4F46E5] rounded-t-lg transition-all hover:bg-[#4338CA] relative group cursor-pointer"
                                style={{ height: `${Math.max(5, (h / (Math.max(...stats.dailyLeads, 1))) * 100)}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {h} leads
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-1">
                        {Array.from({ length: 10 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (9 - i));
                            return (
                                <span key={i} className="text-[10px] font-bold text-[#94A3B8]">
                                    {d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-[#0F172A] mb-8">Top Commerciaux</h2>
                    <div className="space-y-6 relative min-h-[200px]">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                <Loader2 className="animate-spin text-indigo-600" />
                            </div>
                        )}
                        {stats.topPerformers.map((sales, i) => (
                            <div
                                key={i}
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
                            </div>
                        ))}
                        {!loading && stats.topPerformers.length === 0 && (
                            <p className="text-center py-10 text-[#64748B] text-sm font-medium">Aucun commercial n'a encore enregistré de ventes.</p>
                        )}
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

