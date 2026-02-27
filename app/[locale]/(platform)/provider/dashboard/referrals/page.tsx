"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Gift, Copy, Check, Users, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Tipos
interface Referral {
  id: number;
  status: 'pending' | 'completed';
  amount?: number; // Recompensa
  referee: {
    name: string;
    createdAt: string;
  };
}

interface ReferralData {
  referralCode: string;
  referrals: Referral[];
  totalEarnings?: number;
}

// Mock Data
const mockReferralData: ReferralData = {
  referralCode: "MARCOS-VIP-2026",
  totalEarnings: 1500,
  referrals: [
    {
      id: 1,
      status: 'completed',
      amount: 500,
      referee: { name: "Dra. Elena Gómez", createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }
    },
    {
      id: 2,
      status: 'pending',
      amount: 500,
      referee: { name: "Clínica San José", createdAt: new Date().toISOString() }
    }
  ]
};

export default function ProviderReferralsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulación
      await new Promise(r => setTimeout(r, 600));
      setReferralData(mockReferralData);
      
      // Producción:
      // const { data } = await axios.get('/api/provider/referrals', { withCredentials: true });
      // setReferralData(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos de referidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const referralLink = referralData ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralData.referralCode}` : '';

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-gray-400">Cargando programa de referidos...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-900/20">
                    <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Invita y Gana</h1>
                    <p className="text-gray-400 mt-1 max-w-2xl">
                        Comparte QuHealthy con tus colegas. Tú ganas <span className="text-purple-400 font-bold">$500 MXN</span> por cada profesional que se active, y ellos reciben 1 mes gratis.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Link Card */}
                <Card className="bg-gray-900 border-gray-800 flex flex-col justify-center">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Tu Enlace Único</CardTitle>
                        <CardDescription>Comparte este enlace para rastrear tus referidos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input 
                                    readOnly 
                                    value={referralLink} 
                                    className="bg-gray-950 border-gray-700 pr-24 text-gray-300 font-mono text-sm"
                                />
                                <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none bg-gradient-to-l from-gray-950 to-transparent pl-4">
                                    <span className="text-xs text-gray-500">REF: {referralData?.referralCode}</span>
                                </div>
                            </div>
                            <Button onClick={handleCopy} className={`${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-all`}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Earnings Card */}
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" /> Ganancias Totales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white mb-1">
                            ${referralData?.totalEarnings?.toLocaleString()} <span className="text-lg text-gray-500 font-normal">MXN</span>
                        </div>
                        <p className="text-sm text-emerald-400 font-medium">Disponible para retiro</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Referidos */}
            <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" /> Historial de Referidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {referralData && referralData.referrals.length > 0 ? (
                        <div className="space-y-4">
                            {referralData.referrals.map((ref) => (
                                <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                    
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${ref.status === 'completed' ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                                            {ref.referee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{ref.referee.name}</p>
                                            <p className="text-xs text-gray-500">Registrado el {format(new Date(ref.referee.createdAt), "d MMM, yyyy", { locale: es })}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <Badge variant="outline" className={`mb-1 ${
                                            ref.status === 'completed' 
                                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                                            : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                        }`}>
                                            {ref.status === 'completed' ? 'Completado' : 'Pendiente'}
                                        </Badge>
                                        {ref.amount && ref.status === 'completed' && (
                                            <p className="text-sm font-bold text-white">+ ${ref.amount}</p>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <Users className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">Aún no tienes referidos</h3>
                            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                                Comparte tu enlace en redes sociales o por correo para empezar a generar ingresos extra.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </motion.div>
    </div>
  );
}