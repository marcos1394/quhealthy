"use client";

import React from 'react';
import { motion } from "framer-motion";
import { 
  FileText, 
  Image as ImageIcon, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  File,
  Eye,
  Download,
  MoreVertical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * DocumentCard Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos visuales por tipo de documento
 *    - Badges de estado con colores distintivos
 *    - No requiere recordar qué significa cada tipo
 * 
 * 2. AFFORDANCE VISUAL
 *    - Hover states indican interactividad
 *    - Cursor pointer sugiere clickeable
 *    - Acciones secundarias visibles en hover
 * 
 * 3. JERARQUÍA VISUAL
 *    - Nombre del documento más prominente
 *    - Metadata secundaria en gris
 *    - Estado destacado con color
 * 
 * 4. FEEDBACK INMEDIATO
 *    - Scale animation en hover
 *    - Color transitions suaves
 *    - Estados visuales claros
 * 
 * 5. FIGURA/FONDO (Gestalt)
 *    - Card elevado del fondo
 *    - Bordes y sombras crean profundidad
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Información organizada lógicamente
 *    - Escaneo visual rápido
 *    - Acciones agrupadas
 */

// Tipo de documento
export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  status: 'verified' | 'pending' | 'rejected';
  uploadedAt: string;
  size?: string;
  description?: string;
}

interface DocumentCardProps {
  doc: Document;
  onSelect: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
  showActions?: boolean;
  compact?: boolean;
}

// Helper para iconos - RECONOCIMIENTO VISUAL
const getDocumentIcon = (type: string) => {
  const normalizedType = type.toLowerCase();
  
  if (normalizedType.includes('pdf')) {
    return <FileText className="w-6 h-6 text-red-400" />;
  }
  if (normalizedType.includes('imagen') || 
      normalizedType.includes('jpg') || 
      normalizedType.includes('png') ||
      normalizedType.includes('jpeg') ||
      normalizedType.includes('webp')) {
    return <ImageIcon className="w-6 h-6 text-blue-400" />;
  }
  if (normalizedType.includes('certificado') || 
      normalizedType.includes('diploma')) {
    return <Award className="w-6 h-6 text-yellow-400" />;
  }
  
  return <File className="w-6 h-6 text-gray-400" />;
};

// Helper para estados - FEEDBACK VISUAL
const getStatusConfig = (status: Document['status']) => {
  switch (status) {
    case "verified": 
      return { 
        text: "Verificado", 
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20", 
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        dotColor: "bg-emerald-500"
      };
    case "pending": 
      return { 
        text: "En revisión", 
        className: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20", 
        icon: <Clock className="w-3.5 h-3.5" />,
        dotColor: "bg-amber-500"
      };
    case "rejected": 
      return { 
        text: "Rechazado", 
        className: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20", 
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        dotColor: "bg-red-500"
      };
    default: 
      return { 
        text: "Desconocido", 
        className: "bg-gray-500/10 text-gray-400 border-gray-500/30", 
        icon: null,
        dotColor: "bg-gray-500"
      };
  }
};

// Helper para tamaño de archivo - CHUNKING
const formatFileSize = (bytes?: string) => {
  if (!bytes) return null;
  const size = parseInt(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  doc, 
  onSelect,
  onDownload,
  onPreview,
  showActions = true,
  compact = false
}) => {
  const statusInfo = getStatusConfig(doc.status);
  const [isHovered, setIsHovered] = React.useState(false);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(doc);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(doc);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      whileHover={{ scale: 1.01, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 cursor-pointer transition-all group overflow-hidden",
        "hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 hover:bg-gray-900/80",
        compact ? "p-3" : ""
      )}
      onClick={() => onSelect(doc)}
    >
      {/* Glow effect en hover - AFFORDANCE */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center justify-between gap-4">
        {/* Sección izquierda: Icono y Metadata - JERARQUÍA VISUAL */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Contenedor de icono - RECONOCIMIENTO */}
          <div className={cn(
            "p-3 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all duration-300",
            "border border-gray-700/50 group-hover:border-gray-600",
            compact ? "p-2" : ""
          )}>
            {getDocumentIcon(doc.type)}
          </div>
          
          {/* Info del documento - CHUNKING */}
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-semibold text-white truncate group-hover:text-purple-400 transition-colors duration-200",
              compact ? "text-sm" : "text-base"
            )}>
              {doc.name}
            </h3>
            
            {/* Metadata secundaria - MINIMIZAR CARGA COGNITIVA */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="font-medium">{doc.type.toUpperCase()}</span>
              <span>•</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString('es-MX', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}</span>
              {doc.size && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(doc.size)}</span>
                </>
              )}
            </div>

            {/* Descripción opcional */}
            {!compact && doc.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                {doc.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Sección derecha: Estado y Acciones */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Badge de estado - FEEDBACK VISUAL */}
          <Badge 
            variant="outline" 
            className={cn(
              "transition-all duration-200 flex items-center gap-1.5",
              statusInfo.className,
              compact ? "text-xs px-2 py-0.5" : "px-3 py-1"
            )}
          >
            {statusInfo.icon}
            <span className={compact ? "sr-only" : undefined}>
              {statusInfo.text}
            </span>
            {/* Dot indicator para versión compacta */}
            {compact && (
              <span className={cn("w-2 h-2 rounded-full", statusInfo.dotColor)} />
            )}
          </Badge>

          {/* Acciones rápidas - AFFORDANCE */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : -10
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              {onPreview && (
                <button
                  onClick={handlePreview}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200"
                  title="Vista previa"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              
              {onDownload && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              
              <button
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200"
                title="Más opciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Barra de progreso sutil para documentos en revisión - FEEDBACK */}
      {doc.status === 'pending' && !compact && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Variante Grid para mostrar múltiples documentos
 */
export const DocumentGrid: React.FC<{
  documents: Document[];
  onSelect: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
}> = ({ documents, onSelect, onDownload, onPreview }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <DocumentCard
            doc={doc}
            onSelect={onSelect}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Variante List para vista compacta
 */
export const DocumentList: React.FC<{
  documents: Document[];
  onSelect: (doc: Document) => void;
}> = ({ documents, onSelect }) => {
  return (
    <div className="space-y-2">
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
        >
          <DocumentCard
            doc={doc}
            onSelect={onSelect}
            showActions={false}
            compact={true}
          />
        </motion.div>
      ))}
    </div>
  );
};