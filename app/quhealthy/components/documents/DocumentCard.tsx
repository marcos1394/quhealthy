"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Document } from '@/app/quhealthy/types/documents';

interface DocumentCardProps {
  doc: Document;
  onSelect: (doc: Document) => void;
}

const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return "📄";
      case "imagen": return "🖼️";
      case "certificado": return "📜";
      default: return "📋";
    }
};

const getStatusInfo = (status: Document['status']): { text: string; color: string } => {
    switch (status) {
      case "verified": return { text: "Verificado", color: "bg-emerald-500" };
      case "pending": return { text: "Pendiente", color: "bg-amber-500" };
      case "rejected": return { text: "Rechazado", color: "bg-red-500" };
      default: return { text: "Desconocido", color: "bg-gray-500" };
    }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelect }) => {
  const statusInfo = getStatusInfo(doc.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all cursor-pointer"
      onClick={() => onSelect(doc)}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getDocumentTypeIcon(doc.type)}</div>
          <div>
            <h3 className="font-medium text-white truncate w-32">{doc.name}</h3>
            <p className="text-sm text-gray-400">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${statusInfo.color} text-white`}>
          {statusInfo.text}
        </div>
      </div>
    </motion.div>
  );
};