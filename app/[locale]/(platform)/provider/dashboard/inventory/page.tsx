"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PackageSearch, Boxes, ScanLine, Search, Plus, Filter, Pill, ShieldCheck, CheckCircle2, ArrowRightLeft, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCatalog } from '@/hooks/useCatalog';
import { catalogService } from '@/services/catalog.service';
import { UI_Product, UI_Supply } from '@/types/catalog';
import { toast } from 'react-toastify';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarcodeScanner } from '@/components/ui/BarcodeScanner';
import { Separator } from '@/components/ui/separator';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

type InventoryItem = (UI_Product | UI_Supply) & { type: 'PRODUCT' | 'SUPPLY' };

export default function InventoryPage() {
  const t = useTranslations('StoreHub'); // Or wherever we can find translations
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
    // Find item by SKU or Exact Name
    const found = inventory.find(i => i.sku?.toUpperCase() === barcode.toUpperCase() || i.name.toUpperCase() === barcode.toUpperCase());
    if (found) {
      setScannedItem(found);
      setSearchQuery(''); // clear search to focus on this
      toast.success(`Producto encontrado: ${found.name}`, { theme: 'colored' });
      // Auto-open adjust modal
      setAdjustingItem(found);
      setAdjustmentValue(1); // Default to add 1
    } else {
      toast.error(`No se encontró ningún artículo con el código: ${barcode}`, { theme: 'colored' });
      setSearchQuery(barcode); // Put the barcode in search so they can see it
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || typeof adjustmentValue !== 'number') return;
    
    setIsAdjusting(true);
    try {
      await catalogService.adjustStock(adjustingItem.id, adjustmentValue);
      toast.success(`Inventario actualizado exitosamente para ${adjustingItem.name}`, { theme: 'colored' });
      setAdjustingItem(null);
      setAdjustmentValue('');
      await fetchInventory(); // Refresh list
    } catch (error) {
      toast.error('Error al actualizar el inventario.', { theme: 'colored' });
    } finally {
      setIsAdjusting(false);
    }
  };

  if (isCatalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <QhSpinner size="lg" />
        <p className="text-slate-500 font-medium">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-inner">
            <Boxes className="w-10 h-10 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Control de Inventarios
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Escanea códigos de barras, ajusta stock de insumos y productos para la venta.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scanner & Filters */}
        <div className="space-y-6 lg:col-span-1">
          <BarcodeScanner onScan={handleScan} />

          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-medical-500" /> Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por nombre o código..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={filterType === 'ALL' ? 'default' : 'outline'} 
                  onClick={() => setFilterType('ALL')}
                  className={filterType === 'ALL' ? 'bg-medical-600 text-white' : ''}
                  size="sm"
                >
                  Todos
                </Button>
                <Button 
                  variant={filterType === 'PRODUCT' ? 'default' : 'outline'} 
                  onClick={() => setFilterType('PRODUCT')}
                  className={filterType === 'PRODUCT' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : ''}
                  size="sm"
                >
                  <Pill className="w-3.5 h-3.5 mr-1" /> Venta
                </Button>
                <Button 
                  variant={filterType === 'SUPPLY' ? 'default' : 'outline'} 
                  onClick={() => setFilterType('SUPPLY')}
                  className={filterType === 'SUPPLY' ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600' : ''}
                  size="sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Insumos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Inventory List */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-blue-500" /> 
                Listado de Artículos ({filteredInventory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredInventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                    <Boxes className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium text-center">No se encontraron artículos.</p>
                    <p className="text-sm mt-1">Intenta buscar con otro término o agregar artículos a tu catálogo.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInventory.map(item => {
                      const isLowStock = item.stockQuantity <= (item.stockAlertThreshold || 5);
                      
                      return (
                        <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-xl border shrink-0 ${
                              item.type === 'PRODUCT' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
                            }`}>
                              {item.type === 'PRODUCT' ? <Pill className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {item.sku && (
                                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                    {item.sku}
                                  </span>
                                )}
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                                  {item.type === 'PRODUCT' ? 'Venta al Público' : 'Uso Interno (Insumo)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock</p>
                              <Badge className={`text-base px-3 py-1 ${
                                isLowStock 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400' 
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400'
                              }`}>
                                {item.stockQuantity} un
                              </Badge>
                            </div>

                            <Button 
                              variant="outline" 
                              className="shrink-0 font-bold border-slate-200 text-slate-600"
                              onClick={() => { setAdjustingItem(item); setAdjustmentValue(''); }}
                            >
                              <ArrowRightLeft className="w-4 h-4 mr-2" />
                              Ajustar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Adjust Modal */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-medical-500" />
              Ajustar Inventario
            </DialogTitle>
            <DialogDescription>
              Ajusta el stock para <strong className="text-slate-900 dark:text-white">{adjustingItem?.name}</strong>.
              Usa valores positivos para agregar y negativos para descontar (ej. mermas, uso interno).
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Stock Actual:</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{adjustingItem?.stockQuantity}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ajuste (+ / -)</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setAdjustmentValue((v) => (typeof v === 'number' ? v - 1 : -1))}>
                  -
                </Button>
                <Input 
                  type="number" 
                  className="text-center font-bold text-lg" 
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Ej. 10 o -5"
                />
                <Button variant="outline" size="icon" onClick={() => setAdjustmentValue((v) => (typeof v === 'number' ? v + 1 : 1))}>
                  +
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Stock resultante: <strong className="text-slate-700 dark:text-slate-300">
                  {adjustingItem ? adjustingItem.stockQuantity + (typeof adjustmentValue === 'number' ? adjustmentValue : 0) : 0}
                </strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustingItem(null)}>Cancelar</Button>
            <Button 
              className="bg-medical-600 hover:bg-medical-700 text-white" 
              onClick={handleAdjustStock}
              disabled={isAdjusting || typeof adjustmentValue !== 'number' || adjustmentValue === 0}
            >
              {isAdjusting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
