'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Lock, Building2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log('Attempting login with:', email);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('Supabase response:', { data, error });

            if (error) {
                console.error('Login error:', error);
                setError(error.message);
            } else {
                console.log('Login successful, forcing redirect...');
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Unexpected login catch:', err);
            setError('Une erreur est survenue lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50">
                <div className="text-center mb-10">
                    <div className="flex flex-col items-center mb-10">
                        <img src="/logo.png" alt="BRICK Logo" className="h-12 w-auto mb-2" />
                        <p className="text-[#64748B] text-sm font-medium">Administration Dashboard</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#1E293B] block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#F1F5F9] border border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-[#1E293B]"
                                placeholder="gobrick638@gmail.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#1E293B] block">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#F1F5F9] border border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-[#1E293B]"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-[#64748B]">
                    &copy; 2026 BRICK GO. Tous droits réservés.
                </p>
            </div>
        </div>
    );
}
