"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PackageSearch, Boxes, ScanLine, Search, Plus, Filter, Pill, ShieldCheck, CheckCircle2, ArrowRightLeft, Loader2, Save, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCatalog } from '@/hooks/useCatalog';
import { catalogService } from '@/services/catalog.service';
import { UI_Product, UI_Supply } from '@/types/catalog';
import { toast } from 'react-toastify';

import { BarcodeScanner } from '@/components/ui/BarcodeScanner';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type InventoryItem = (UI_Product | UI_Supply) & { type: 'PRODUCT' | 'SUPPLY' };

export default function InventoryPage() {
  const t = useTranslations('StoreHub'); 
  const { products, supplies, fetchInventory, isLoading: isCatalogLoading } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PRODUCT' | 'SUPPLY'>('ALL');
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  
  // Stock adjustment state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number | ''>('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Combine products and supplies into a single inventory list
  const inventory: InventoryItem[] = useMemo(() => {
    const p = products.map(p => ({ ...p, type: 'PRODUCT' as const }));
    const s = supplies.map(s => ({ ...s, type: 'SUPPLY' as const }));
    return [...p, ...s];
  }, [products, supplies]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'ALL' || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [inventory, searchQuery, filterType]);

  const handleScan = (barcode: string) => {
    const found = inventory.find(i => i.sku?.toUpperCase() === barcode.toUpperCase() || i.name.toUpperCase() === barcode.toUpperCase());
    if (found) {
      setScannedItem(found);
      setSearchQuery(''); 
      toast.success(`ÍTEM LOCALIZADO: ${found.name.toUpperCase()}`, { theme: 'colored' });
      setAdjustingItem(found);
      setAdjustmentValue(1); 
    } else {
      toast.error(`CÓDIGO NO IDENTIFICADO: ${barcode}`, { theme: 'colored' });
      setSearchQuery(barcode); 
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || typeof adjustmentValue !== 'number') return;
    
    setIsAdjusting(true);
    try {
      await catalogService.adjustStock(adjustingItem.id, adjustmentValue);
      toast.success(`INVENTARIO ACTUALIZADO: ${adjustingItem.name.toUpperCase()}`, { theme: 'colored' });
      setAdjustingItem(null);
      setAdjustmentValue('');
      await fetchInventory(); 
    } catch (error) {
      toast.error('FALLO EN LA ACTUALIZACIÓN DE STOCK.', { theme: 'colored' });
    } finally {
      setIsAdjusting(false);
    }
  };

  if (isCatalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">SINCRONIZANDO INVENTARIO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER ARQUITECTÓNICO --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <Boxes className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Logística y Almacén
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                CONTROL DE INVENTARIOS
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                AUDITORÍA, ESCÁNER DE CÓDIGOS Y AJUSTE DE STOCK FÍSICO.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLUMNA IZQUIERDA (CONTROLES) --- */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Escáner */}
            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none">
              <div className="p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center gap-2">
                <ScanLine className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">ÓPTICA / ESCÁNER</span>
              </div>
              <div className="p-6 flex flex-col relative min-h-[200px]">
                <BarcodeScanner onScan={handleScan} />
              </div>
            </div>

            {/* Filtros */}
            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none">
              <div className="p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">PARÁMETROS DE BÚSQUEDA</span>
              </div>
              
              <div className="relative border-b border-black/10 dark:border-white/10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <input 
                  placeholder="BUSCAR NOMBRE O CÓDIGO..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
              </div>

              <div className="flex bg-gray-50 dark:bg-[#050505]">
                <button 
                  onClick={() => setFilterType('ALL')}
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center border-r border-black/10 dark:border-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest",
                    filterType === 'ALL' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:bg-white dark:hover:bg-[#111]"
                  )}
                >
                  TODOS
                </button>
                <button 
                  onClick={() => setFilterType('PRODUCT')}
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center gap-2 border-r border-black/10 dark:border-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest",
                    filterType === 'PRODUCT' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:bg-white dark:hover:bg-[#111]"
                  )}
                >
                  <Pill className="w-3 h-3" strokeWidth={1.5} /> VENTA
                </button>
                <button 
                  onClick={() => setFilterType('SUPPLY')}
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center gap-2 transition-colors text-[9px] font-bold uppercase tracking-widest",
                    filterType === 'SUPPLY' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:bg-white dark:hover:bg-[#111]"
                  )}
                >
                  <ShieldCheck className="w-3 h-3" strokeWidth={1.5} /> INSUMOS
                </button>
              </div>
            </div>

          </div>

          {/* --- COLUMNA DERECHA (KARDEX) --- */}
          <div className="lg:col-span-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none min-h-[600px] max-h-[800px]">
            <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                <PackageSearch className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> 
                KARDEX DE ARTÍCULOS
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white dark:bg-[#0a0a0a] px-2 py-1 border border-black/10 dark:border-white/10">
                {filteredInventory.length} REGISTROS
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
                    <Boxes className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                    CERO COINCIDENCIAS
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
                    NO SE ENCONTRARON ARTÍCULOS. INTENTE CON OTRO TÉRMINO O CÓDIGO DE BARRAS.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-black/10 dark:divide-white/10">
                  {filteredInventory.map(item => {
                    const isLowStock = item.stockQuantity <= (item.stockAlertThreshold || 5);
                    
                    return (
                      <div key={item.id} className="p-6 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
                        
                        <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
                          <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
                            {item.type === 'PRODUCT' ? <Pill className="w-5 h-5 text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} /> : <ShieldCheck className="w-5 h-5 text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors truncate mb-2">
                              {item.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3">
                              {item.sku && (
                                <span className="border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                                  SKU: {item.sku}
                                </span>
                              )}
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                                {item.type === 'PRODUCT' ? 'PÚBLICO (VENTA)' : 'INTERNO (INSUMO)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">DISPONIBLE</p>
                            <span className={cn(
                              "inline-flex border px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-none",
                              isLowStock 
                                ? "border-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400"
                                : "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"
                            )}>
                              {item.stockQuantity} UN.
                            </span>
                          </div>

                          <button 
                            className="h-12 px-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
                            onClick={() => { setAdjustingItem(item); setAdjustmentValue(''); }}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span className="hidden sm:inline">AJUSTAR</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL AJUSTE DE STOCK --- */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
          
          <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Modificación Manual
                </p>
                <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                  AJUSTAR INVENTARIO
                </DialogTitle>
              </div>
            </div>
            <button onClick={() => setAdjustingItem(null)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0">
              <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
            
            <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
                ESTABLEZCA EL AJUSTE PARA <span className="text-black dark:text-white underline">{adjustingItem?.name}</span>. UTILICE VALORES POSITIVOS PARA ENTRADAS Y NEGATIVOS PARA MERMAS O USO INTERNO.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              
              {/* Stock Actual */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">STOCK REGISTRADO</span>
                <span className="text-4xl font-semibold tracking-tight text-black dark:text-white">
                  {adjustingItem?.stockQuantity}
                </span>
              </div>

              {/* Controles de Ajuste */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">DIFERENCIAL (+ / -)</span>
                <div className="flex items-stretch h-14 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                  <button 
                    onClick={() => setAdjustmentValue((v) => (typeof v === 'number' ? v - 1 : -1))}
                    className="w-14 flex items-center justify-center border-r border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    <span className="text-lg font-bold">-</span>
                  </button>
                  <input 
                    type="number" 
                    className="flex-1 bg-transparent border-0 text-center text-lg font-bold text-black dark:text-white focus:outline-none focus:ring-0" 
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                  />
                  <button 
                    onClick={() => setAdjustmentValue((v) => (typeof v === 'number' ? v + 1 : 1))}
                    className="w-14 flex items-center justify-center border-l border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-4 text-center">
                  PROYECCIÓN FINAL: <span className="text-black dark:text-white">{adjustingItem ? adjustingItem.stockQuantity + (typeof adjustmentValue === 'number' ? adjustmentValue : 0) : 0}</span>
                </p>
              </div>

            </div>
          </div>

          <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
            <button 
              onClick={() => setAdjustingItem(null)}
              className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
            >
              ANULAR
            </button>
            <button 
              onClick={handleAdjustStock}
              disabled={isAdjusting || typeof adjustmentValue !== 'number' || adjustmentValue === 0}
              className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
            >
              {isAdjusting ? (
                <><QhSpinner size="sm" className="text-current" /> PROCESANDO...</>
              ) : (
                <><Save className="w-4 h-4" strokeWidth={1.5} /> APLICAR AUDITORÍA</>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}