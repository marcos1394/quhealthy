"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2, ArrowRight, LockKeyhole } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '@/lib/axios';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiClient.post('/api/auth/admin/login', {
                email,
                password
            });

            // The backend returns { token, refreshToken, role }
            // Ensure cookies/tokens are set
            document.cookie = `__Secure-userRole=${response.data.role}; path=/; secure; samesite=none`;
            document.cookie = `refreshToken=${response.data.refreshToken}; path=/; secure; samesite=none`;

            toast.success("Bienvenido al panel de administración");
            
            const callbackUrl = searchParams.get('callbackUrl');
            if (callbackUrl) {
                router.push(callbackUrl);
            } else {
                router.push('/admin/dashboard');
            }
        } catch (error: any) {
            console.error('Error logging in admin:', error);
            const msg = error.response?.data?.message || "Credenciales inválidas o sin permisos.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-medical-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-medical-500/5 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl">
                        <ShieldCheck className="w-8 h-8 text-medical-500" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight">QuHealthy Admin</h1>
                    <p className="text-slate-400 mt-2">Acceso restringido a personal autorizado</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Correo Corporativo</label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@quhealthy.org"
                                className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-4 text-white placeholder-slate-600 focus:outline-none focus:border-medical-500 focus:ring-1 focus:ring-medical-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Contraseña</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-medical-500 focus:ring-1 focus:ring-medical-500 transition-all"
                                />
                                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="w-full h-14 bg-medical-500 hover:bg-medical-600 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-medical-500 shadow-lg shadow-medical-500/20"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Ingresar al Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs mt-8">
                    &copy; {new Date().getFullYear()} QuHealthy Inc. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
