/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Gift, Copy, Check} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los datos que esperamos
interface Referral {
  id: number;
  status: 'pending' | 'completed';
  referee: {
    name: string;
    createdAt: string;
  };
}
interface ReferralData {
  referralCode: string;
  referrals: Referral[];
}

export default function ProviderReferralsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/provider/referrals', { withCredentials: true });
      setReferralData(data);
    } catch (error) {
      toast.error("No se pudieron cargar tus datos de referidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralData?.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("¡Enlace copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center gap-4">
        <Gift className="w-8 h-8 text-purple-400"/>
        <div>
            <h1 className="text-3xl font-bold text-white">Invita a un Colega y Gana</h1>
            <p className="text-gray-400 mt-1">Obtén recompensas por cada profesional que se una a QuHealthy gracias a ti.</p>
        </div>
      </div>
      
      {/* Sección para compartir el enlace */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Tu Enlace de Referido Único</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-300">
            {referralLink}
          </div>
          <Button onClick={handleCopy} className="w-full sm:w-auto">
            {copied ? <Check className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
            {copied ? 'Copiado' : 'Copiar Enlace'}
          </Button>
        </CardContent>
      </Card>

      {/* Sección de seguimiento de referidos */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
            <CardTitle>Tus Referidos ({referralData?.referrals.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {referralData && referralData.referrals.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {referralData.referrals.map(ref => (
                <li key={ref.referee.name} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{ref.referee.name}</p>
                    <p className="text-sm text-gray-400">
                      Se unió el {format(new Date(ref.referee.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <Badge className={ref.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
                    {ref.status === 'completed' ? 'Recompensa Obtenida' : 'Pendiente'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Aún no tienes referidos. ¡Comparte tu enlace para empezar a ganar!</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}