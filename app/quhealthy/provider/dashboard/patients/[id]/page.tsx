/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Calendar, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los datos que esperamos del endpoint
interface ClientDetails {
  client: {
    id: number;
    name: string;
    email: string;
    profileImageUrl: string | null;
    createdAt: string;
  };
  history: {
    id: number;
    status: string;
    startTime: string;
    privateNotes: string | null;
    service: { name: string };
  }[];
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [clientData, setClientData] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/provider/clients/${clientId}`, { withCredentials: true });
      setClientData(data);
    } catch (error) {
      toast.error("No se pudo cargar el perfil del paciente.");
      router.back(); // Si hay error, vuelve a la página anterior
    } finally {
      setIsLoading(false);
    }
  }, [clientId, router]);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, fetchClientDetails]);

  if (isLoading || !clientData) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  const { client, history } = clientData;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="default" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-2xl bg-purple-600/20 text-purple-300">
              {client.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">{client.name}</h1>
            <p className="text-gray-400 flex items-center gap-2"><Mail className="w-4 h-4"/>{client.email}</p>
          </div>
        </div>
      </div>

      {/* Tarjeta de Historial de Citas */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-purple-400" /> Historial de Citas ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map(appt => (
                <div key={appt.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{appt.service.name}</p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(appt.startTime), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                    <Badge>{appt.status}</Badge>
                  </div>
                  {appt.privateNotes && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 font-semibold">NOTAS PRIVADAS:</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{appt.privateNotes}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Este paciente aún no tiene un historial de citas.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}