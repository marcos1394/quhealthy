"use client";

import React from 'react';
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Award, Clock, CheckCircle, AlertCircle, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Definimos el tipo aquí para auto-contención, o impórtalo si ya tienes un archivo types
export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  status: 'verified' | 'pending' | 'rejected';
  uploadedAt: string;
  size?: string; // Opcional
}

interface DocumentCardProps {
  doc: Document;
  onSelect: (doc: Document) => void;
}

const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return <FileText className="w-6 h-6 text-red-400" />;
      case "imagen": 
      case "jpg":
      case "png": return <ImageIcon className="w-6 h-6 text-blue-400" />;
      case "certificado": return <Award className="w-6 h-6 text-yellow-400" />;
      default: return <File className="w-6 h-6 text-gray-400" />;
    }
};

const getStatusConfig = (status: Document['status']) => {
    switch (status) {
      case "verified": 
        return { 
            text: "Verificado", 
            className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", 
            icon: <CheckCircle className="w-3 h-3 mr-1" /> 
        };
      case "pending": 
        return { 
            text: "Pendiente", 
            className: "bg-amber-500/10 text-amber-400 border-amber-500/20", 
            icon: <Clock className="w-3 h-3 mr-1" /> 
        };
      case "rejected": 
        return { 
            text: "Rechazado", 
            className: "bg-red-500/10 text-red-400 border-red-500/20", 
            icon: <AlertCircle className="w-3 h-3 mr-1" /> 
        };
      default: 
        return { text: "Desconocido", className: "bg-gray-500/10 text-gray-400", icon: null };
    }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelect }) => {
  const statusInfo = getStatusConfig(doc.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      whileHover={{ scale: 1.01 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all cursor-pointer shadow-sm group"
      onClick={() => onSelect(doc)}
    >
      <div className="flex items-center justify-between gap-4">
        
        {/* Icono y Nombre */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
            {getDocumentIcon(doc.type)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate text-sm md:text-base group-hover:text-purple-400 transition-colors">
                {doc.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{doc.type.toUpperCase()}</span>
                <span>•</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Estado Badge */}
        <Badge variant="outline" className={`${statusInfo.className} shrink-0`}>
            {statusInfo.icon}
            {statusInfo.text}
        </Badge>

      </div>
    </motion.div>
  );
};