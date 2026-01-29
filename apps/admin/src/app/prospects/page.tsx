"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Briefcase,
    Download,
    Filter,
    Search,
    MoreHorizontal,
    Phone,
    Mail,
    Building2,
    Calendar,
    ChevronDown,
    Loader2,
    MapPin
} from "lucide-react";

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchProspects();

        const channel = supabase
            .channel('prospects-list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'prospects' },
                () => fetchProspects()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [statusFilter]);

    const fetchProspects = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('prospects')
                .select('*, assigned_profile:profiles(first_name, last_name)')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProspects(data || []);
        } catch (err) {
            console.error("Error fetching prospects:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action: string) => {
        if (action === "Exporter CSV") {
            handleExportCSV();
        } else {
            alert(`${action} - Bientôt disponible !`);
        }
    };

    const handleExportCSV = () => {
        if (prospects.length === 0) return alert('Aucune donnée à exporter.');

        // Define headers
        const headers = ["Prénom", "Nom", "Entreprise", "Email", "Téléphone", "Statut", "Besoin", "Date", "Commercial"];

        // Format rows
        const rows = prospects.map(p => [
            p.first_name,
            p.last_name,
            p.company || '',
            p.email || '',
            p.phone,
            p.status,
            p.need || '',
            new Date(p.created_at).toLocaleDateString(),
            p.assigned_profile ? `${p.assigned_profile.first_name} ${p.assigned_profile.last_name}` : ''
        ]);

        // Build CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(r => `"${r}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `prospects_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'qualifié': return 'bg-green-100 text-green-700';
            case 'new':
            case 'nouveau': return 'bg-blue-100 text-blue-700';
            case 'en cours': return 'bg-amber-100 text-amber-700';
            case 'perdu': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <main className="flex-1 p-10 overflow-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Prospects</h1>
                    <p className="text-[#64748B] mt-1 text-sm font-medium">Suivez et gérez tous les leads générés par vos équipes terrain.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => handleAction("Exporter CSV")}
                        className="bg-white border border-[#E2E8F0] text-[#0F172A] px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center space-x-2 transition-all hover:bg-slate-50"
                    >
                        <Download size={18} />
                        <span>Exporter CSV</span>
                    </button>
                    <button
                        onClick={() => document.querySelector('select')?.focus()}
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
                    >
                        <Filter size={18} />
                        <span>Filtrer</span>
                    </button>
                </div>
            </header>

            {/* Filters Summary */}
            <div className="flex items-center space-x-4 mb-8">
                <div className="bg-indigo-50 text-[#4F46E5] px-4 py-2 rounded-xl border border-indigo-100 flex items-center space-x-2">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un prospect ou une société..."
                        className="bg-transparent border-none text-sm font-semibold focus:ring-0 w-80 placeholder:text-indigo-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        className="bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl text-sm font-bold text-[#64748B] focus:ring-0 outline-none cursor-pointer hover:bg-slate-50 transition-colors appearance-none pr-8"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Statut: Tous</option>
                        <option value="new">Nouveau</option>
                        <option value="qualifié">Qualifié</option>
                        <option value="en cours">En cours</option>
                        <option value="perdu">Perdu</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F8FAFC]">
                            <tr>
                                <th className="px-6 py-4">Prospect</th>
                                <th className="px-6 py-4">Localisation</th>
                                <th className="px-6 py-4">Besoin</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Commercial</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {prospects.filter(p =>
                                (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                p.company?.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((prospect) => (
                                <tr key={prospect.id} className="hover:bg-[#F8FAFC]/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {prospect.first_name[0]}{prospect.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#0F172A]">{prospect.first_name} {prospect.last_name}</div>
                                                <div className="text-[11px] text-[#64748B] font-semibold">{prospect.company || 'Particulier'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center space-x-2 text-[#475569] font-medium text-xs">
                                                <Building2 size={14} className="text-slate-400" />
                                                <span>{prospect.address || 'Non renseignée'}</span>
                                                {prospect.google_map_link && (
                                                    <a
                                                        href={prospect.google_map_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1 rounded-full"
                                                        title="Voir la position GPS"
                                                    >
                                                        <MapPin size={12} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-1 text-[10px] text-[#94A3B8]">
                                                <Calendar size={10} />
                                                <span>{new Date(prospect.created_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-[#0F172A] text-sm">{prospect.need || 'Non spécifié'}</div>
                                        {prospect.comments && (
                                            <p className="text-[10px] text-[#64748B] mt-1 max-w-[150px] truncate" title={prospect.comments}>
                                                "{prospect.comments}"
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(prospect.status)}`}>
                                            {prospect.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2 text-xs text-[#64748B] font-medium">
                                                <Phone size={12} className="text-indigo-400" />
                                                <span>{prospect.phone}</span>
                                            </div>
                                            {prospect.email && (
                                                <div className="flex items-center space-x-2 text-[10px] text-[#94A3B8]">
                                                    <Mail size={10} />
                                                    <span>{prospect.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-[#4F46E5]">
                                                {prospect.assigned_profile?.first_name?.[0] || 'U'}
                                            </div>
                                            <span className="text-xs font-semibold text-[#64748B]">
                                                {prospect.assigned_profile ? `${prospect.assigned_profile.first_name}` : 'Non assigné'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleAction(`Options pour ${prospect.first_name}`)}
                                            className="text-[#94A3B8] group-hover:text-[#4F46E5] transition-colors p-1 rounded-md hover:bg-slate-50"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {prospects.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-[#64748B] font-medium">
                                        Aucun prospect trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-xs font-bold text-[#64748B]">
                    <div>Affichage de {prospects.length} prospects</div>
                </div>
            </div>
        </main>
    );
}

