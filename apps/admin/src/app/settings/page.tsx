"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Users,
    Shield,
    Globe,
    Plus,
    Trash2,
    Save,
    Check
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);

    // Settings State
    const [activeCurrency, setActiveCurrency] = useState({ code: "XOF", symbol: "FCFA" });

    // Mock Data for UI options
    const availableCurrencies = [
        { code: "XOF", name: "Franc CFA", symbol: "FCFA" },
        { code: "EUR", name: "Euro", symbol: "€" },
        { code: "USD", name: "US Dollar", symbol: "$" },
    ];

    const [admins, setAdmins] = useState([
        { id: 1, name: "Admin Principal", email: "admin@brickgo.com", role: "Super Admin", status: "Actif" },
        { id: 2, name: "Support Tech", email: "support@brickgo.com", role: "Support", status: "Actif" },
    ]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .single();

            if (data) {
                setActiveCurrency({ code: data.currency_code, symbol: data.currency_symbol });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetCurrency = async (curr: any) => {
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({ currency_code: curr.code, currency_symbol: curr.symbol })
                .eq('id', 1);

            if (error) {
                await supabase.from('app_settings').insert([{ id: 1, currency_code: curr.code, currency_symbol: curr.symbol }]);
            }

            setActiveCurrency({ code: curr.code, symbol: curr.symbol });
            alert(`Devise changée pour : ${curr.name}`);
        } catch (err: any) {
            alert('Erreur : ' + err.message);
        }
    };

    const tabs = [
        { id: "general", label: "Général", icon: Globe },
        { id: "currencies", label: "Devises", icon: CreditCard },
        { id: "admins", label: "Administrateurs", icon: Users },
        { id: "security", label: "Sécurité", icon: Shield },
    ];

    return (
        <main className="p-6 lg:p-10 bg-[#F8FAFC]">
            <header className="mb-8 lg:mb-10 text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight">Paramètres</h1>
                <p className="text-[#64748B] mt-1 text-sm font-medium">Gérez la plateforme globale.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 space-x-3 lg:space-x-0 lg:space-y-2 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 flex items-center space-x-3 px-5 py-3.5 lg:px-4 lg:py-3 rounded-2xl transition-all duration-200 font-bold text-sm whitespace-nowrap shadow-sm border ${activeTab === tab.id
                                        ? "bg-[#4F46E5] text-white border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                                        : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 lg:p-10 min-h-[600px]">

                    {/* GENERAL TAB */}
                    {activeTab === "general" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A] mb-4">Informations Générales</h2>
                                <div className="grid gap-6 max-w-xl">
                                    <div>
                                        <label className="block text-sm font-bold text-[#64748B] mb-2">Nom de l'application</label>
                                        <input type="text" defaultValue="BRICK GO" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] font-bold outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#64748B] mb-2">Email de support</label>
                                        <input type="email" defaultValue="contact@brickgo.com" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] font-bold outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-[#E2E8F0]">
                                <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all">
                                    <Save size={18} />
                                    <span>Enregistrer les modifications</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CURRENCIES TAB */}
                    {activeTab === "currencies" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-[#0F172A]">Devises gérées</h2>
                                    <p className="text-sm text-[#64748B]">La devise active sera utilisée partout sur l'application.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {availableCurrencies.map((curr, idx) => {
                                    const isActive = activeCurrency.code === curr.code;
                                    return (
                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isActive ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "bg-white border-[#E2E8F0]"}`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm border ${isActive ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200"}`}>
                                                    {curr.symbol}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0F172A]">{curr.name}</div>
                                                    <div className="text-xs font-bold text-[#64748B]">{curr.code}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                {isActive ? (
                                                    <div className="flex items-center text-indigo-600 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                                                        <Check size={14} className="mr-1" /> Active
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSetCurrency(curr)}
                                                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                    >
                                                        Activer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ADMINS TAB */}
                    {activeTab === "admins" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-[#0F172A]">Gestion des Administrateurs</h2>
                                    <p className="text-sm text-[#64748B]">Gérez les accès et les rôles de votre équipe.</p>
                                </div>
                                <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg shadow-indigo-500/20">
                                    <Plus size={16} />
                                    <span>Inviter un admin</span>
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8FAFC] text-[#64748B] text-xs font-bold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Utilisateur</th>
                                            <th className="px-6 py-4">Rôle</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E2E8F0]">
                                        {admins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            {admin.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#0F172A] text-sm">{admin.name}</div>
                                                            <div className="text-xs text-[#64748B]">{admin.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-sm text-[#475569]">{admin.role}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                                        {admin.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#94A3B8] hover:text-red-500 transition-colors font-medium text-sm">
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-[#0F172A]">Sécurité</h2>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start space-x-3">
                                <Shield className="text-amber-500 mt-1" size={20} />
                                <div>
                                    <h3 className="font-bold text-amber-800">Authentification à deux facteurs (2FA)</h3>
                                    <p className="text-sm text-amber-700 mt-1">L'activation de la 2FA sera bientôt disponible pour tous les comptes administrateurs.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
