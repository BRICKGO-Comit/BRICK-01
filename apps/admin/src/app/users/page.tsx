"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Users,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    Shield,
    UserCheck,
    UserMinus,
    Loader2,
    X,
    CheckCircle
} from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'commercial'
    });

    useEffect(() => {
        fetchUsers();

        // Real-time synchronization
        const channel = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                console.log('Real-time update:', payload);
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchUsers = async () => {
        // Don't set global loading to true on refresh to avoid flicker, only on initial load if needed
        // or use a separate refreshing state.
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            alert("Erreur chargement utilisateurs: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, role: string) => {
        const newRole = role === 'blocked' ? 'commercial' : 'blocked';
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', id);

        if (error) alert(error.message);
        // fetchUsers() will be triggered by real-time subscription
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            // Success
            setIsModalOpen(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                role: 'commercial'
            });
            alert('Utilisateur créé avec succès !');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <main className="flex-1 p-10 overflow-auto relative">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Commerciaux</h1>
                    <p className="text-[#64748B] mt-1 text-sm font-medium">Gérez vos commerciaux et leurs accès à l'application mobile.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Nouveau Commercial</span>
                </button>
            </header>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
                    </div>
                )}
                <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                    <h2 className="text-xl font-bold text-[#0F172A]">Liste des comptes</h2>
                    <div className="bg-[#4F46E5]/10 text-[#4F46E5] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse"></div>
                        SYNC EN TEMPS RÉEL
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F8FAFC]">
                            <tr>
                                <th className="px-6 py-4">Utilisateur</th>
                                <th className="px-6 py-4">Rôle</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#4F46E5] font-bold">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#0F172A]">
                                                    {user.first_name || user.last_name
                                                        ? `${user.first_name || ''} ${user.last_name || ''}`
                                                        : user.email}
                                                </div>
                                                <div className="text-xs text-[#64748B] font-medium tracking-tight">Membre depuis {new Date(user.created_at).getFullYear()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1.5">
                                            {user.role === 'admin' ? <Shield size={14} className="text-red-500" /> : <Users size={14} className="text-slate-400" />}
                                            <span className="text-sm font-semibold text-[#475569] capitalize">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2 text-xs text-[#64748B]">
                                                <Mail size={12} />
                                                <span>{user.email || 'N/A'}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center space-x-2 text-xs text-[#64748B]">
                                                    <Phone size={12} />
                                                    <span>{user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wide ${user.role !== 'blocked' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {user.role !== 'blocked' ? 'ACTIF' : 'BLOQUÉ'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            {user.role === 'blocked' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, user.role)}
                                                    className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                    title="Débloquer"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, user.role)}
                                                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                                    title="Bloquer"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            )}
                                            {/* <button
                                                className="p-2 hover:bg-slate-100 text-[#64748B] rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[#64748B]">
                                        Aucun commercial trouvé. Créez-en un !
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de création */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
                            <h3 className="text-xl font-bold text-[#0F172A]">Nouveau Commercial</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#64748B] mb-2">Prénom</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                                        placeholder="Ex: Jean"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#64748B] mb-2">Nom</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                                        placeholder="Ex: Dupont"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                                    placeholder="jean.dupont@brickgo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Téléphone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                                    placeholder="Ex: 06 12 34 56 78"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Mot de passe temporaire</label>
                                <input
                                    type="text" // Visible for admin creation
                                    name="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all bg-gray-50"
                                    placeholder="Minimum 6 caractères"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {creating ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        <span>Créer le compte</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
