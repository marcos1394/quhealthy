"use client";

import React from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, User, FileText, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Importamos tipos del componente tabla
import { HistoryEntry } from './HistoryTable';

type UserRole = "paciente" | "proveedor";

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  role: UserRole;
  onOpenChange: (open: boolean) => void;
}

const getRatingStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
      ))}
    </div>
);

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ entry, role, onOpenChange }) => {
  if (!entry) return null;

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold">Detalle del Servicio</DialogTitle>
                <DialogDescription className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(entry.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
            
            {/* Grid de Info Principal */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                        <User className="w-3 h-3" /> {role === "paciente" ? "Especialista" : "Paciente"}
                    </p>
                    <p className="text-base font-semibold text-white">
                        {role === "paciente" ? entry.provider?.name : entry.client?.name}
                    </p>
                    {role === "paciente" && (
                        <p className="text-xs text-purple-400">{entry.provider?.specialty}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Servicio
                    </p>
                    <p className="text-base font-semibold text-white">{entry.type}</p>
                    {entry.duration && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {entry.duration}
                        </p>
                    )}
                </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Notas / Feedback */}
            <div className="space-y-3">
                {entry.rating && role === "paciente" && (
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Tu Calificación</span>
                        {getRatingStars(entry.rating)}
                    </div>
                )}

                {entry.notes && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase">Notas del servicio</p>
                        <p className="text-sm text-gray-300 italic bg-gray-950 p-3 rounded-lg border border-gray-800">
                            &quot;{entry.notes}&quot;
                        </p>
                    </div>
                )}
            </div>

        </div>

        <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
                Cerrar
            </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};