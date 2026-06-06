"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserX, AlertTriangle, Loader2, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import apiClient from "@/lib/axios";
import { handleApiError } from "@/lib/handleApiError";

export default function DeleteAccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (confirmText !== 'ELIMINAR') {
            toast.error('Debes escribir ELIMINAR para confirmar.');
            return;
        }

        if (!password) {
            toast.error('La contraseña es requerida.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.delete('/api/auth/account', {
                data: { password }
            });

            toast.success('Cuenta eliminada permanentemente. Redirigiendo...', {
                icon: <UserX className="text-emerald-500" />
            });
            
            // Redirect or logout after successful deletion
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);

        } catch (error: any) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-rose-500/30">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
                        <UserX className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Eliminar Cuenta</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Borrar permanentemente tu cuenta y todos tus datos asociados.</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <form onSubmit={handleDelete}>
                        <Card className="bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 shadow-sm border-2">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-rose-600 dark:text-rose-500 text-xl flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6" />
                                    Zona de Peligro
                                </CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 text-base">
                                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de que realmente quieres hacer esto. 
                                    Todos tus datos, incluyendo citas, historial médico y configuraciones serán eliminados de forma irreversible de acuerdo con la LFPDPPP.
                                </CardDescription>
                            </CardHeader>

                            <Separator className="bg-rose-100 dark:bg-rose-900/30" />

                            <CardContent className="space-y-6 pt-6">

                                <Alert variant="destructive" className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300">
                                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                    <AlertTitle>Acción Irreversible</AlertTitle>
                                    <AlertDescription className="font-medium mt-1">
                                        Esta acción no se puede deshacer. Se perderá acceso inmediato a la plataforma.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Por favor, escribe "ELIMINAR" para confirmar</Label>
                                        <Input
                                            type="text"
                                            required
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder="ELIMINAR"
                                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500 h-11"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Ingresa tu contraseña actual</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500 h-11"
                                        />
                                    </div>
                                </div>

                            </CardContent>

                            <CardFooter className="border-t border-rose-100 dark:border-rose-900/30 pt-6 flex justify-end bg-rose-50/50 dark:bg-rose-950/20 rounded-b-xl">
                                <Button
                                    type="submit"
                                    disabled={loading || confirmText !== 'ELIMINAR' || !password}
                                    variant="destructive"
                                    className="bg-rose-600 hover:bg-rose-700 text-white min-w-[160px] h-11"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <UserX className="mr-2 h-4 w-4" /> Eliminar Cuenta
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
