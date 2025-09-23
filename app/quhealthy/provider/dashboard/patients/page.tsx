/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Users, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Definimos el tipo para los datos de cliente que esperamos
interface Client {
  totalAppointments: number;
  lastAppointmentDate: string;
  consumer: {
    id: number;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
}

export default function ProviderPatientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/provider/clients', { withCredentials: true });
      setClients(data);
    } catch (error) {
      toast.error("No se pudo cargar tu lista de pacientes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mis Pacientes</h1>
          <p className="text-gray-400 mt-1">
            {clients.length > 0 ? `Tienes un total de ${clients.length} pacientes.` : 'Aún no tienes pacientes registrados.'}
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Añadir Paciente
        </Button>
      </div>
      
      {clients.length > 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Paciente</TableHead>
                <TableHead className="text-white text-center">Citas Totales</TableHead>
                <TableHead className="text-white">Última Cita</TableHead>
                <TableHead className="text-white text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(({ consumer, totalAppointments, lastAppointmentDate }) => (
                <TableRow key={consumer.id} className="border-gray-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-purple-600/20 text-purple-300">
                          {consumer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{consumer.name}</p>
                        <p className="text-sm text-gray-400">{consumer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white font-semibold">{totalAppointments}</TableCell>
                  <TableCell className="text-gray-300">
                    {format(new Date(lastAppointmentDate), "d 'de' MMMM, yyyy", { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Perfil <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Tu lista de pacientes aparecerá aquí</h3>
          <p className="text-gray-400 mt-2">Cuando un nuevo cliente agende una cita, lo verás en esta sección.</p>
        </div>
      )}
    </motion.div>
  );
}