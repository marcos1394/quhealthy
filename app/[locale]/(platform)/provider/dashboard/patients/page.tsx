"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Users, UserPlus, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

// Tipos
interface Client {
  id: number; // ID único para la key de react
  totalAppointments: number;
  lastAppointmentDate: string;
  status: 'active' | 'inactive'; // Nuevo campo sugerido
  consumer: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    profileImageUrl: string | null;
  };
}

// Mock Data
const mockClients: Client[] = [
  {
    id: 1,
    totalAppointments: 5,
    lastAppointmentDate: new Date().toISOString(),
    status: 'active',
    consumer: { id: 101, name: "Ana López", email: "ana.lopez@email.com", profileImageUrl: null }
  },
  {
    id: 2,
    totalAppointments: 12,
    lastAppointmentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'active',
    consumer: { id: 102, name: "Carlos Ruiz", email: "carlos.r@email.com", profileImageUrl: "https://github.com/shadcn.png" }
  },
  {
    id: 3,
    totalAppointments: 1,
    lastAppointmentDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    status: 'inactive',
    consumer: { id: 103, name: "Maria Garcia", email: "m.garcia@email.com", profileImageUrl: null }
  }
];

export default function ProviderPatientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulación
      await new Promise(r => setTimeout(r, 600));
      setClients(mockClients);
      
      // Producción:
      // const { data } = await axios.get('/api/provider/clients', { withCredentials: true });
      // setClients(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar la lista de pacientes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filtrado local
  const filteredClients = clients.filter(c => 
    c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.consumer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-gray-400">Cargando base de pacientes...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-500" />
                        Mis Pacientes
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {clients.length > 0 ? `Gestionando ${clients.length} expedientes activos.` : 'Comienza a construir tu base de pacientes.'}
                    </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Paciente Manual
                </Button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                        placeholder="Buscar por nombre o email..." 
                        className="pl-9 bg-gray-950 border-gray-700 focus:border-purple-500 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Aquí podrías añadir más filtros (Select) si fuera necesario */}
            </div>
            
            {/* Tabla de Pacientes */}
            {filteredClients.length > 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <Table>
                    <TableHeader className="bg-gray-950">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-medium pl-6">Paciente</TableHead>
                        <TableHead className="text-gray-400 font-medium text-center">Estado</TableHead>
                        <TableHead className="text-gray-400 font-medium text-center">Citas Totales</TableHead>
                        <TableHead className="text-gray-400 font-medium">Última Visita</TableHead>
                        <TableHead className="text-right text-gray-400 font-medium pr-6">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredClients.map(({ id, consumer, totalAppointments, lastAppointmentDate, status }) => (
                        <TableRow key={id} className="border-gray-800 hover:bg-gray-800/50 transition-colors group">
                        
                        <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-gray-700">
                                    <AvatarImage src={consumer.profileImageUrl || ''} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                                        {consumer.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                                        {consumer.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{consumer.email}</p>
                                </div>
                            </div>
                        </TableCell>

                        <TableCell className="text-center">
                            <Badge variant="outline" className={`
                                ${status === 'active' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-gray-600 text-gray-400'}
                            `}>
                                {status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </TableCell>

                        <TableCell className="text-center text-white font-medium">
                            {totalAppointments}
                        </TableCell>

                        <TableCell className="text-gray-400 text-sm">
                            {format(new Date(lastAppointmentDate), "d MMM, yyyy", { locale: es })}
                        </TableCell>

                        <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="sm" className="hover:bg-purple-500/10 hover:text-purple-300">
                                Ver Perfil <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </TableCell>

                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                    <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">No se encontraron pacientes</h3>
                    <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                        {searchTerm ? `No hay resultados para "${searchTerm}"` : "Tu lista está vacía. Los pacientes aparecerán aquí cuando agenden su primera cita."}
                    </p>
                    {searchTerm && (
                        <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-purple-400">
                            Limpiar búsqueda
                        </Button>
                    )}
                </div>
            )}

        </motion.div>
    </div>
  );
}