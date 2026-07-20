import React from 'react';
import { Search, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { clinicalTemplateService, ClinicalTemplateResponse } from '@/services/clinicalTemplates.service';
import { useSessionStore } from '@/store/useSessionStore';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
  typeFilter?: string;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  typeFilter
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { user } = useSessionStore();
  const providerId = user?.id;
  const [templates, setTemplates] = React.useState<ClinicalTemplateResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const loadTemplates = async () => {
      if (!isOpen || !providerId) return;
      try {
        setIsLoading(true);
        // Only get personal templates to inject in SOAP
        const data = await clinicalTemplateService.getTemplates(providerId);
        setTemplates(data.filter(t => !t.isPublic)); 
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, [isOpen, providerId]);

  const filteredTemplates = templates.filter(tpl => {
    if (typeFilter && tpl.category !== typeFilter) return false;
    if (searchQuery && !tpl.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black dark:border-white">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            Cargar Plantilla
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Buscar plantilla..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-8 uppercase tracking-widest">
              No se encontraron plantillas
            </p>
          ) : (
            filteredTemplates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => {
                  if (tpl.content) {
                    onSelect(tpl.content);
                    onClose();
                  }
                }}
                className="w-full text-left p-4 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors group bg-white dark:bg-[#050505]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-black dark:text-white group-hover:underline">
                    {tpl.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1">
                    {tpl.category || tpl.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {tpl.content || "Sin contenido"}
                </p>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
