import React from 'react';
import { VaultDocumentWidget as VaultDocumentWidgetType, VaultDocumentData } from '@quhealthy/health-os-contract';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image as ImageIcon, Download, Search, File } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  widget: VaultDocumentWidgetType;
  onAction?: (action: any) => void;
}

export const VaultDocumentWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data } = widget;
  const { documents } = data;

  if (!documents || documents.length === 0) {
    return (
      <Card className="p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm rounded-2xl">
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No se encontraron documentos</h4>
            <p className="text-xs text-gray-500 mt-1">Intenta buscar con otros términos o asegúrate de tener documentos en tu Bóveda.</p>
          </div>
        </div>
      </Card>
    );
  }

  const getFileIcon = (contentType?: string) => {
    if (contentType?.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (contentType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-emerald-500" />;
  };

  const handleDownload = (docId: string) => {
    if (onAction) {
      onAction({
        type: 'download',
        payload: { documentId: docId }
      });
    }
  };

  return (
    <Card className="p-4 sm:p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm rounded-2xl overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Documentos Clínicos Encontrados
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          {documents.length} resultados
        </span>
      </div>

      <div className="space-y-3">
        {documents.map((doc: VaultDocumentData) => (
          <div 
            key={doc.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                {getFileIcon(doc.contentType)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={doc.title}>
                  {doc.title || 'Documento sin título'}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                  <span className="uppercase font-medium tracking-wide">{doc.documentType || 'General'}</span>
                  <span>•</span>
                  <span>{doc.createdAt ? format(new Date(doc.createdAt), "d MMM, yyyy", { locale: es }) : 'Fecha desconocida'}</span>
                  {doc.fileSizeBytes && (
                    <>
                      <span>•</span>
                      <span>{(doc.fileSizeBytes / 1024).toFixed(0)} KB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(doc.id)}
              className="w-full sm:w-auto h-8 text-xs font-semibold rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Descargar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
