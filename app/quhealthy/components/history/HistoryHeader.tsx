"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCheck, Briefcase, FileDown } from "lucide-react";
import { UserRole } from '@/app/quhealthy/types/history';

interface HistoryHeaderProps {
  role: UserRole;
  entryCount: number;
  onExport: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({ role, entryCount, onExport }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="bg-teal-500/10 p-3 rounded-full">
        {role === "paciente" ? (
          <UserCheck className="w-8 h-8 text-teal-400" />
        ) : (
          <Briefcase className="w-8 h-8 text-teal-400" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-teal-400">
          Historial de {role === "paciente" ? "servicios recibidos" : "servicios brindados"}
        </h1>
        <p className="text-sm text-gray-400">
          {entryCount} {entryCount === 1 ? 'registro' : 'registros'} encontrados
        </p>
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-2">
      <Button 
        variant="outline"
        className="border-teal-400 text-teal-400 hover:bg-teal-400/20"
        onClick={onExport}
      >
        <FileDown className="w-4 h-4 mr-2" />
        Exportar
      </Button>
    </div>
  </div>
);