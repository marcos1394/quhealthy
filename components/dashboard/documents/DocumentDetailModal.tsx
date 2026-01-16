"use client";

import React from 'react';
import { 
    Trash2, Eye, Download, FileText, Calendar, 
    HardDrive, ShieldCheck, AlertTriangle 
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogDescription 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Importamos el tipo Document desde la tarjeta para consistencia
import { Document } from './DocumentCard';

interface DocumentDetailModalProps {
  doc: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: number) => void;
  onDownload?: (doc: Document) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ 
    doc, 
    isOpen, 
    onClose, 
    onDelete, 
    onDownload 
}) => {
  
  if (!doc) return null;
  
  const isVerified = doc.status === 'verified';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
                <DialogTitle className="text-xl">{doc.name}</DialogTitle>
                <DialogDescription className="text-gray-400">Detalles del archivo</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
            
            {/* Preview Area (Placeholder) */}
            <div className="w-full h-32 bg-gray-950/50 rounded-xl border border-gray-800 border-dashed flex flex-col items-center justify-center text-gray-500 gap-2">
                <Eye className="w-8 h-8 opacity-50" />
                <span className="text-xs">Vista previa no disponible</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <p className="text-gray-500 flex items-center gap-2"><HardDrive className="w-3 h-3"/> Tipo</p>
                    <p className="font-medium text-white uppercase">{doc.type}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-gray-500 flex items-center gap-2"><Calendar className="w-3 h-3"/> Subido el</p>
                    <p className="font-medium text-white">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1 col-span-2">
                    <p className="text-gray-500 flex items-center gap-2"><ShieldCheck className="w-3 h-3"/> Estado</p>
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium border ${
                        isVerified 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                        {isVerified ? <ShieldCheck className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                        {isVerified ? 'Verificado por QuHealthy' : 'Pendiente de revisión'}
                    </div>
                </div>
            </div>
        </div>

        <Separator className="bg-gray-800" />

        <DialogFooter className="flex gap-2 sm:justify-between w-full">
            {onDelete && (
                <Button 
                    variant="ghost" 
                    onClick={() => onDelete(doc.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </Button>
            )}
            
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                    Cerrar
                </Button>
                <Button 
                    onClick={() => onDownload && onDownload(doc)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <Download className="w-4 h-4 mr-2" /> Descargar
                </Button>
            </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};