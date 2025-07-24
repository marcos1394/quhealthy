"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye } from "lucide-react";
import { Document } from '@/app/quhealthy/types/documents';

interface DocumentDetailModalProps {
  doc: Document | null;
  onOpenChange: (open: boolean) => void;
}

const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return "📄";
      case "imagen": return "🖼️";
      case "certificado": return "📜";
      default: return "📋";
    }
};

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ doc, onOpenChange }) => {
  if (!doc) return null;
  
  return (
    <Dialog open={!!doc} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>{doc.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-6xl">
            {getDocumentTypeIcon(doc.type)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Tipo</p>
              <p className="font-medium">{doc.type}</p>
            </div>
            <div>
              <p className="text-gray-400">Fecha</p>
              <p className="font-medium">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-teal-500 hover:bg-teal-600">
              <Eye className="w-4 h-4 mr-2" />
              Ver documento
            </Button>
            <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};