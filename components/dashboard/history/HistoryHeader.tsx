"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCheck, Briefcase, FileDown, History } from "lucide-react";

// Tipos
export type UserRole = "paciente" | "proveedor";

interface HistoryHeaderProps {
  role: UserRole;
  entryCount: number;
  onExport: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({ role, entryCount, onExport }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
    <div className="flex items-center gap-4">
      <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
        {role === "paciente" ? (
          <UserCheck className="w-8 h-8 text-purple-400" />
        ) : (
          <Briefcase className="w-8 h-8 text-purple-400" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Historial de {role === "paciente" ? "Consultas" : "Servicios"}
        </h1>
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <History className="w-3 h-3" />
          {entryCount} {entryCount === 1 ? 'registro' : 'registros'} encontrados
        </p>
      </div>
    </div>
    
    <div className="flex flex-col md:flex-row gap-3">
      <Button 
        variant="outline"
        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
        onClick={onExport}
      >
        <FileDown className="w-4 h-4 mr-2" />
        Exportar CSV
      </Button>
    </div>
  </div>
);