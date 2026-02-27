"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Loader2, Calendar, ArrowLeft, Mail, Phone, MapPin, 
  FileText, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Tipos
interface ClientDetails {
  client: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profileImageUrl: string | null;
    createdAt: string;
    notes?: string;
  };
  history: {
    id: number;
    status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
    startTime: string;
    privateNotes: string | null;
    service: { name: string };
  }[];
}

// Mock Data
const mockClientData: ClientDetails = {
  client: {
    id: 101,
    name: "Ana López",
    email: "ana.lopez@email.com",
    phone: "+52 55 1234 5678",
    address: "CDMX, México",
    profileImageUrl: null,
    createdAt: "2023-01-15T10:00:00Z",
    notes: "Paciente alérgico a la penicilina."
  },
  history: [
    {
      id: 1,
      status: 'completed',
      startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      service: { name: "Consulta General" },
      privateNotes: "Paciente reportó mejoría en los síntomas."
    },
    {
      id: 2,
      status: 'canceled_by_consumer',
      startTime: new Date(Date.now() - 86400000 * 10).toISOString(),
      service: { name: "Limpieza Dental" },
      privateNotes: null
    },
    {
      id: 3,
      status: 'confirmed',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      service: { name: "Seguimiento" },
      privateNotes: null
    }
  ]
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Manejo seguro del ID (puede venir como string o array)
  const clientId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [clientData, setClientData] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientDetails = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      // Simulación
      await new Promise(r => setTimeout(r, 600));
      setClientData(mockClientData);
      
      // Producción:
      // const { data } = await axios.get(`/api/provider/clients/${clientId}`, { withCredentials: true });
      // setClientData(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el perfil.");
      // router.back(); // Opcional: redirigir si falla
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  // Helpers de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Completada</Badge>;
      case 'confirmed': return <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">Confirmada</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20">Pendiente</Badge>;
      default: return <Badge variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">Cancelada</Badge>;
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-gray-400">Cargando expediente...</p>
        </div>
    );
  }

  if (!clientData) return null;

  const { client, history } = clientData;

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
            
            {/* Header / Botón Atrás */}
            <div>
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="text-gray-400 hover:text-white pl-0 gap-2 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a lista
                </Button>
            </div>

            {/* Perfil del Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Columna Izquierda: Datos Personales */}
                <Card className="bg-gray-900 border-gray-800 md:col-span-1 h-fit">
                    <CardHeader className="flex flex-col items-center text-center pb-2">
                        <Avatar className="w-24 h-24 mb-4 border-4 border-gray-800 shadow-xl">
                            <AvatarImage src={client.profileImageUrl || ''} />
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                                {client.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl text-white">{client.name}</CardTitle>
                        <CardDescription className="text-gray-400">Paciente desde {new Date(client.createdAt).getFullYear()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-gray-300">
                                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate">{client.email}</span>
                            </div>
                            {client.phone && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span>{client.phone}</span>
                                </div>
                            )}
                            {client.address && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span>{client.address}</span>
                                </div>
                            )}
                        </div>
                        
                        {client.notes && (
                            <div className="mt-6 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                                <p className="text-xs text-yellow-500 font-semibold mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> NOTAS MÉDICAS
                                </p>
                                <p className="text-sm text-gray-300 italic">{client.notes}</p>
                            </div>
                        )}

                        <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 mt-4">
                            Editar Perfil
                        </Button>
                    </CardContent>
                </Card>

                {/* Columna Derecha: Historial */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Calendar className="w-5 h-5 text-purple-500" /> 
                                Historial Clínico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history.length > 0 ? (
                                <div className="relative border-l border-gray-800 ml-3 space-y-8 py-2">
                                    {history.map((appt) => (
                                        <div key={appt.id} className="relative pl-8">
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${
                                                appt.status === 'completed' ? 'bg-emerald-500' : 
                                                appt.status === 'confirmed' ? 'bg-blue-500' : 'bg-gray-600'
                                            }`} />
                                            
                                            <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-white text-lg">{appt.service.name}</h4>
                                                        <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {format(new Date(appt.startTime), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                                        </p>
                                                    </div>
                                                    <div>{getStatusBadge(appt.status)}</div>
                                                </div>

                                                {appt.privateNotes && (
                                                    <div className="mt-3 pt-3 border-t border-gray-800">
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Notas Privadas</p>
                                                        <p className="text-sm text-gray-300 bg-gray-900 p-2 rounded-lg border border-gray-800">
                                                            {appt.privateNotes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No hay historial de citas registrado.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>

        </motion.div>
    </div>
  );
}