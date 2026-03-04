"use client";

import React, { useRef } from "react";
import { Plus, Trash2, Save, ImagePlus, ShoppingBag, Box, Barcode, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UI_Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface ProductsManagerProps {
  products: UI_Product[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Product>) => void;
  onSave: (product: UI_Product) => void;
  onDelete: (id: number) => void;
  onImageUpload: (id: number, file: File) => void;
}

export function ProductsManager({
  products, onAdd, onUpdate, onSave, onDelete, onImageUpload
}: ProductsManagerProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const t = useTranslations('Marketplace');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-500" /> Farmacia y Productos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Vende suplementos, cremas o equipo médico con control de inventario.</p>
        </div>
        <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> Agregar Producto
        </Button>
      </div>

      <div className="space-y-4">
        {products.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No tienes productos físicos registrados.</p>
          </div>
        )}

        {products.map((product) => (
          <Card key={product.id} className={cn(
            "border transition-all duration-300 shadow-sm",
            product.isNew ? "border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
            product.hasUnsavedChanges && !product.isNew ? "border-amber-300 dark:border-amber-500/50" : ""
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">

                {/* 📸 Imagen del Producto */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRefs.current[product.id]?.click()}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold">Cambiar</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={el => { fileInputRefs.current[product.id] = el; }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onImageUpload(product.id, e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* 📝 Formulario */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Producto</label>
                      <Input value={product.name} onChange={e => onUpdate(product.id, { name: e.target.value })} placeholder="Ej. Crema Hidratante" className="font-bold border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio ($)</label>
                        <Input type="number" min="0" value={product.price} onChange={e => onUpdate(product.id, { price: parseFloat(e.target.value) || 0 })} className="border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><Tag className="w-3 h-3 mr-1" /> Categoría</label>
                        <Input value={product.category} onChange={e => onUpdate(product.id, { category: e.target.value })} placeholder="Ej. Skincare" className="border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción Breve</label>
                    <Input value={product.description} onChange={e => onUpdate(product.id, { description: e.target.value })} placeholder="Beneficios e instrucciones de uso..." className="border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center"><Box className="w-3 h-3 mr-1" /> Stock (Unidades)</label>
                      <Input type="number" min="0" value={product.stockQuantity} onChange={e => onUpdate(product.id, { stockQuantity: parseInt(e.target.value) || 0 })} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center"><Barcode className="w-3 h-3 mr-1" /> SKU / Código</label>
                      <Input value={product.sku || ''} onChange={e => onUpdate(product.id, { sku: e.target.value })} placeholder="Opcional" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => onDelete(product.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                    </Button>
                    <Button
                      onClick={() => onSave(product)}
                      disabled={!product.hasUnsavedChanges && !product.isNew}
                      className={cn(
                        "rounded-xl shadow-sm transition-all",
                        product.hasUnsavedChanges || product.isNew ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                      )}
                    >
                      <Save className="w-4 h-4 mr-2" /> {product.isNew ? 'Guardar Nuevo' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}