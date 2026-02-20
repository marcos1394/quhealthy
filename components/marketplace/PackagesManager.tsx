"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  Tag, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  DollarSign,
  Percent,
  X,
  Zap,
  ShoppingCart,
  Camera
} from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Importamos el tipo Service
import { Service } from "./ServicesManager";

// --- TIPOS ---
export interface ServicePackage {
  id: number;
  name: string;
  description: string;
  price: number;
  serviceIds: number[];
  imageUrl?: string; // 📸 NUEVO
  isNew?: boolean;
  color?: string;
}

interface PackagesManagerProps {
  packages: ServicePackage[];
  availableServices: Service[];
  onSave: (pkg: ServicePackage) => void;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void; // 📸 NUEVO
}

export function PackagesManager({ 
  packages, 
  availableServices, 
  onSave, 
  onDelete,
  onImageUpload
}: PackagesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [realValue, setRealValue] = useState(0);
  const [savings, setSavings] = useState(0);

  // Calcular valor real - FEEDBACK INMEDIATO
  useEffect(() => {
    if (editingPackage) {
      const calculated = calculateRealValue(editingPackage.serviceIds);
      setRealValue(calculated);
      
      const currentSavings = calculated - editingPackage.price;
      setSavings(Math.max(0, currentSavings));
    }
  }, [editingPackage]);

  // --- HELPERS ---
  const calculateRealValue = (serviceIds: number[]) => {
    return serviceIds.reduce((total, id) => {
      const service = availableServices.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
  };

  const calculateSavingsPercent = (realVal: number, packagePrice: number) => {
    if (realVal === 0) return 0;
    const saving = realVal - packagePrice;
    return Math.round((saving / realVal) * 100);
  };

  // Sugerencias de precio inteligentes - SATISFICING
  const getSuggestedPrices = (realVal: number) => {
    return [
      { label: '10% OFF', percent: 10, price: Math.round(realVal * 0.9), color: 'blue' },
      { label: '15% OFF', percent: 15, price: Math.round(realVal * 0.85), color: 'purple' },
      { label: '20% OFF', percent: 20, price: Math.round(realVal * 0.8), color: 'emerald' }
    ];
  };

  // --- LÓGICA DE EDICIÓN ---
  const handleOpenDialog = (pkg?: ServicePackage) => {
    if (pkg) {
      setEditingPackage({ ...pkg });
      const realVal = calculateRealValue(pkg.serviceIds);
      const currentPercent = calculateSavingsPercent(realVal, pkg.price);
      setDiscountPercent(currentPercent || 15);
    } else {
      setEditingPackage({
        id: -Date.now(),
        name: "",
        description: "",
        price: 0,
        serviceIds: [],
        isNew: true,
        color: 'purple'
      });
      setDiscountPercent(15);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPackage && editingPackage.name && editingPackage.price > 0 && editingPackage.serviceIds.length > 0) {
      onSave(editingPackage);
      toast.success("¡Paquete guardado exitosamente! 🎉");
      setIsDialogOpen(false);
      setEditingPackage(null);
    } else {
      toast.error("Completa todos los campos requeridos");
    }
  };

  const toggleServiceInPackage = (serviceId: number) => {
    if (!editingPackage) return;
    
    const currentIds = editingPackage.serviceIds;
    let newIds;
    
    if (currentIds.includes(serviceId)) {
      newIds = currentIds.filter(id => id !== serviceId);
    } else {
      newIds = [...currentIds, serviceId];
    }
    
    setEditingPackage({ ...editingPackage, serviceIds: newIds });
  };

  // Aplicar sugerencia de precio - SATISFICING
  const applySuggestedPrice = (price: number, percent: number) => {
    if (!editingPackage) return;
    setEditingPackage({ ...editingPackage, price });
    setDiscountPercent(percent);
    toast.success(`Aplicado ${percent}% de descuento`);
  };

  // Aplicar descuento por slider - FEEDBACK INMEDIATO
  const applyDiscountPercent = (percent: number) => {
    if (!editingPackage || realValue === 0) return;
    const newPrice = Math.round(realValue * (1 - percent / 100));
    setEditingPackage({ ...editingPackage, price: newPrice });
    setDiscountPercent(percent);
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20"
            >
              <Package className="w-6 h-6 text-pink-400" />
            </motion.div>
            Paquetes y Promociones
          </CardTitle>
          <CardDescription className="text-gray-400 flex items-center gap-2">
            Agrupa servicios para aumentar ventas
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +40% conversión
            </Badge>
          </CardDescription>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Crear Paquete
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        
        {/* Empty State */}
        {packages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50"
          >
            <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-4 border border-gray-700">
              <Tag className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-base font-semibold text-white mb-1">No hay paquetes activos</p>
            <p className="text-sm text-gray-500 mb-4">Crea tu primer paquete para aumentar ventas</p>
            <Button 
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Paquete
            </Button>
          </motion.div>
        ) : (
          /* Packages Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {packages.map((pkg) => {
                const realVal = calculateRealValue(pkg.serviceIds);
                const savingsAmt = Math.max(0, realVal - pkg.price);
                const savingsPerc = calculateSavingsPercent(realVal, pkg.price);

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-black text-white">{pkg.name}</h3>
                            {savingsAmt > 0 && (
                              <Badge className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 border-emerald-500/20">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {savingsPerc}% OFF
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {pkg.description || "Paquete personalizado"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="default"
                            onClick={() => handleOpenDialog(pkg)} 
                            className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="default"
                            onClick={() => {
                              onDelete(pkg.id);
                              toast.success("Paquete eliminado");
                            }}
                            className="h-9 w-9 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Services Chips */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.serviceIds.map(id => {
                          const s = availableServices.find(service => service.id === id);
                          return s ? (
                            <span 
                              key={id} 
                              className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {s.name}
                            </span>
                          ) : null;
                        })}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-end justify-between pt-4 border-t border-gray-800">
                        <div>
                          {savingsAmt > 0 && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 line-through">${realVal}</span>
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                                Ahorras ${savingsAmt}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              ${pkg.price}
                            </span>
                            <span className="text-sm text-gray-500">MXN</span>
                          </div>
                        </div>

                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                          {pkg.serviceIds.length} servicios
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Footer */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300/80">
              <p className="font-semibold text-blue-400 mb-1">
                💡 Tip: Los paquetes aumentan las ventas en promedio un 40%
              </p>
              <p>
                Los clientes prefieren paquetes con 15-20% de descuento. 
                Mantén tus precios competitivos y atractivos.
              </p>
            </div>
          </motion.div>
        )}

        {/* --- MODAL DE EDICIÓN --- */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black text-white mb-1">
                    {editingPackage?.id && editingPackage.id > 0 ? "Editar Paquete" : "Crear Nuevo Paquete"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Combina servicios para crear una oferta atractiva
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            {editingPackage && (
              <div className="space-y-6 py-4">
                
                {/* Value Preview Card - FEEDBACK VISUAL */}
                {editingPackage.serviceIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Valor Real</p>
                        <p className="text-2xl font-black text-white">${realValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Tu Precio</p>
                        <p className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          ${editingPackage.price}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Ahorro</p>
                        <p className="text-2xl font-black text-emerald-400">${savings}</p>
                        <p className="text-xs text-emerald-400">
                          {calculateSavingsPercent(realValue, editingPackage.price)}% OFF
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Package Details */}
                 <div className="flex gap-4 items-start">
  {/* 📸 Imagen del Paquete */}
  <div className="relative group/pkg-img flex-shrink-0">
    <div className={cn(
      "w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer bg-gray-950",
      editingPackage.imageUrl ? "border-pink-500/50" : "border-dashed border-gray-700 hover:border-pink-500/50 hover:bg-gray-800"
    )}>
      {editingPackage.imageUrl ? (
        <img src={editingPackage.imageUrl} alt="Paquete" className="w-full h-full object-cover" />
      ) : (
        <>
          <Camera className="w-5 h-5 text-gray-500 mb-1 group-hover/pkg-img:text-pink-400 transition-colors" />
          <span className="text-[9px] text-gray-500 font-bold uppercase">Foto</span>
        </>
      )}
    </div>
    <input 
      type="file" 
      accept="image/*"
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload && editingPackage) {
          // Actualizamos localmente para feedback inmediato
          const tempUrl = URL.createObjectURL(file);
          setEditingPackage({ ...editingPackage, imageUrl: tempUrl });
          // Llamamos a la subida real a GCP
          onImageUpload(editingPackage.id, file);
        }
        e.target.value = '';
      }}
    />
  </div>

  <div className="space-y-2 flex-1">
    <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
      <Tag className="w-4 h-4 text-purple-400" />
      Nombre del Paquete
    </Label>
    <Input 
      value={editingPackage.name}
      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
      placeholder="Ej: Pack Bienestar Total"
      className="bg-gray-950 border-gray-700 h-12 text-base focus:border-purple-500"
    />
  </div>
</div>

                  {/* Right Column: Services Selection */}
                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col h-full">
                    <Label className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                      <ShoppingCart className="w-4 h-4 text-blue-400" />
                      Servicios Incluidos ({editingPackage.serviceIds.length})
                    </Label>
                    
                    {availableServices.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-lg">
                        <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
                        <p className="text-sm font-semibold text-white mb-1">
                          No hay servicios disponibles
                        </p>
                        <p className="text-xs text-gray-500">
                          Primero crea servicios en la sección anterior
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="flex-1 h-[300px] pr-3">
                        <div className="space-y-2">
                          {availableServices.map(service => {
                            const isSelected = editingPackage.serviceIds.includes(service.id);
                            
                            return (
                              <motion.div 
                                key={service.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                  isSelected 
                                    ? "bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10" 
                                    : "border-gray-800 hover:bg-gray-800 hover:border-gray-700"
                                )}
                                onClick={() => toggleServiceInPackage(service.id)}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleServiceInPackage(service.id)}
                                  className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white mb-0.5">
                                    {service.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-800 text-gray-400 text-xs">
                                      ${service.price}
                                    </Badge>
                                    {service.duration && (
                                      <span className="text-xs text-gray-600">
                                        {service.duration} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 min-w-[140px]"
                disabled={!editingPackage?.serviceIds.length || !editingPackage?.name || editingPackage.price <= 0}
              >
                <Zap className="w-4 h-4 mr-2" />
                Guardar Paquete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}