"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Users,
  LayoutDashboard,
  TrendingUp,
  MoreHorizontal,
  Plus,
  Briefcase,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState([
    { label: "TOTAL PROSPECTS", value: "0", growth: "+0%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "REVENU", value: "0", growth: "+0%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "COMMERCIAUX ACTIFS", value: "0", growth: "+0", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "TAUX CONVERSION", value: "0%", growth: "+0%", icon: LayoutDashboard, color: "text-orange-600", bg: "bg-orange-50" },
  ]);
  const [recentProspects, setRecentProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time listener
    const prospectsChannel = supabase
      .channel('dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospects' },
        () => {
          console.log('Prospects changed, refreshing dashboard...');
          fetchDashboardData();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log('Profiles changed, refreshing dashboard...');
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prospectsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch settings separately or resiliently to avoid breaking dashboard if it fails
      const { data: settingsData } = await supabase.from('app_settings').select('currency_symbol').limit(1).maybeSingle();
      const currencySymbol = settingsData?.currency_symbol || 'FCFA'; // Default to FCFA if not found, or maybe empty string

      const [prospectsRes, profilesRes, recentRes] = await Promise.all([
        supabase.from('prospects').select('id, status, deal_value'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'blocked'),
        supabase.from('prospects').select('*, assigned_profile:profiles(first_name, last_name)').order('created_at', { ascending: false }).limit(5)
      ]);

      const allProspects = prospectsRes.data || [];
      const totalProspects = allProspects.length;
      const activeReps = profilesRes.count || 0;

      // Calculate Revenue
      const wonProspects = allProspects.filter(p => p.status === 'converted' || p.status === 'won' || p.status === 'gagné' || p.status === 'qualifié');
      const revenue = wonProspects.reduce((acc, curr) => acc + (curr.deal_value || 0), 0);

      // Calculate Conversion Rate
      const conversionRate = totalProspects > 0 ? ((wonProspects.length / totalProspects) * 100).toFixed(1) : 0;

      setStats([
        { label: "TOTAL PROSPECTS", value: totalProspects.toLocaleString(), growth: "+0%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "REVENU", value: `${revenue.toLocaleString()} ${currencySymbol}`, growth: "+0%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
        { label: "COMMERCIAUX ACTIFS", value: activeReps.toString(), growth: "+0", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "TAUX CONVERSION", value: `${conversionRate}%`, growth: "+0%", icon: LayoutDashboard, color: "text-orange-600", bg: "bg-orange-50" },
      ]);

      setRecentProspects(recentRes.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string) => {
    alert(`${action} - Fonctionnalité en cours de préparation !`);
  };

  return (
    <main className="flex-1 p-10 overflow-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Tableau de bord</h1>
          <p className="text-[#64748B] mt-1 text-sm font-medium">Bienvenue, voici l'activité de vos commerciaux aujourd'hui.</p>
        </div>
        <button
          onClick={() => router.push('/users')}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Ajouter un commercial</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative">
        {loading && (
          <div className="absolute inset-x-0 -top-4 flex justify-center">
            <div className="bg-white px-4 py-1 rounded-full shadow-sm border border-[#E2E8F0] flex items-center space-x-2">
              <Loader2 size={12} className="animate-spin text-indigo-500" />
              <span className="text-[10px] font-bold text-[#64748B]">SYNCHRONISATION...</span>
            </div>
          </div>
        )}
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (stat.label === "TOTAL PROSPECTS") router.push('/prospects');
              else if (stat.label === "REVENU") router.push('/prospects'); // Revenue view in prospects or separate stats page? Prospects is safest for now.
              else if (stat.label === "COMMERCIAUX ACTIFS") router.push('/users');
              else if (stat.label === "TAUX CONVERSION") router.push('/stats'); // Assuming stats page exists or logic
              else handleAction(`Détail ${stat.label}`);
            }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center space-x-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                <span>{stat.growth}</span>
              </div>
            </div>
            <h3 className="text-[#64748B] text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
            <p className="text-2xl font-black mt-1 text-[#0F172A]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
          </div>
        )}
        <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <h2 className="text-xl font-bold text-[#0F172A]">Prospects Récents</h2>
          <button
            onClick={() => router.push('/prospects')}
            className="text-[#4F46E5] text-sm font-bold hover:underline"
          >
            Voir tout
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F8FAFC]">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Entreprise</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Sales Rep</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {recentProspects.map((prospect, i) => (
                <tr key={prospect.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0F172A]">{prospect.first_name} {prospect.last_name}</div>
                    <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-tighter">{new Date(prospect.created_at).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4 text-[#475569] font-medium">{prospect.company || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wide ${prospect.status === 'Qualifié' ? 'bg-green-100 text-green-700' :
                      (prospect.status === 'Nouveau' || prospect.status === 'new') ? 'bg-blue-100 text-blue-700' :
                        prospect.status === 'En cours' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                      }`}>
                      {prospect.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {prospect.assigned_profile?.first_name?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-semibold text-[#475569]">
                        {prospect.assigned_profile ? `${prospect.assigned_profile.first_name} ${prospect.assigned_profile.last_name}` : 'Non assigné'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAction(`Options pour ${prospect.first_name}`)}
                      className="text-[#94A3B8] hover:text-[#4F46E5] transition-colors p-1 rounded-md hover:bg-indigo-50"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentProspects.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#64748B] font-medium">Aucun prospect récent.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

