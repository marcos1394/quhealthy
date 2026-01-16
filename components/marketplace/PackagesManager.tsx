"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Trash2, Edit2, Tag, AlertCircle } from "lucide-react";

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

// Importamos el tipo Service para referencia
import { Service } from "./ServicesManager";

// --- TIPOS ---
export interface ServicePackage {
  id: number;
  name: string;
  description: string;
  price: number;
  serviceIds: number[]; // IDs de los servicios incluidos
  isNew?: boolean;
}

interface PackagesManagerProps {
  packages: ServicePackage[];
  availableServices: Service[]; // Necesario para calcular totales y mostrar nombres
  onSave: (pkg: ServicePackage) => void;
  onDelete: (id: number) => void;
}

export function PackagesManager({ packages, availableServices, onSave, onDelete }: PackagesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  // --- LÓGICA DE EDICIÓN ---
  const handleOpenDialog = (pkg?: ServicePackage) => {
    if (pkg) {
      setEditingPackage({ ...pkg });
    } else {
      // Nuevo Paquete
      setEditingPackage({
        id: -Date.now(),
        name: "",
        description: "",
        price: 0,
        serviceIds: [],
        isNew: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPackage && editingPackage.name && editingPackage.price > 0 && editingPackage.serviceIds.length > 0) {
      onSave(editingPackage);
      setIsDialogOpen(false);
      setEditingPackage(null);
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

  // Calculadora de valor real (suma de servicios individuales)
  const calculateRealValue = (serviceIds: number[]) => {
    return serviceIds.reduce((total, id) => {
      const service = availableServices.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
              <Package className="w-5 h-5 text-pink-400" />
            </div>
            Paquetes y Promociones
          </CardTitle>
          <CardDescription className="text-gray-400">
            Agrupa servicios para aumentar tus ventas.
          </CardDescription>
        </div>
        <Button 
            onClick={() => handleOpenDialog()} 
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Crear Paquete
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        
        {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                <div className="p-3 bg-gray-800 rounded-full mb-3">
                    <Tag className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">No hay paquetes activos.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {packages.map((pkg) => {
                        const realValue = calculateRealValue(pkg.serviceIds);
                        const savings = realValue - pkg.price;
                        const savingsPercent = realValue > 0 ? Math.round((savings / realValue) * 100) : 0;

                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                                            {savings > 0 && (
                                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                                                    Ahorra {savingsPercent}%
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1 max-w-md">{pkg.description}</p>
                                        
                                        {/* Servicios incluidos (Chips) */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {pkg.serviceIds.map(id => {
                                                const s = availableServices.find(service => service.id === id);
                                                return s ? (
                                                    <span key={id} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                                                        {s.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            {savings > 0 && (
                                                <span className="text-xs text-gray-500 line-through mb-0.5">${realValue}</span>
                                            )}
                                            <span className="text-xl font-bold text-white">${pkg.price}</span>
                                        </div>
                                        
                                        <div className="flex gap-2 mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end">
                                            <Button variant="ghost" size="default" onClick={() => handleOpenDialog(pkg)} className="h-8 w-8 text-gray-400 hover:text-white">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="default" onClick={() => onDelete(pkg.id)} className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-900/20">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        )}

        {/* --- MODAL DE EDICIÓN --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {editingPackage?.id && editingPackage.id > 0 ? "Editar Paquete" : "Crear Nuevo Paquete"}
                    </DialogTitle>
                    <DialogDescription>
                        Combina servicios existentes para crear una oferta atractiva.
                    </DialogDescription>
                </DialogHeader>

                {editingPackage && (
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Columna Izquierda: Datos */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre del Paquete</Label>
                                    <Input 
                                        value={editingPackage.name}
                                        onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                                        placeholder="Ej: Pack Bienestar Total"
                                        className="bg-gray-950 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio Final ($)</Label>
                                    <Input 
                                        type="number"
                                        value={editingPackage.price}
                                        onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                                        className="bg-gray-950 border-gray-700 text-lg font-bold"
                                    />
                                    {/* Calculadora de ahorro en tiempo real */}
                                    <div className="text-xs text-right mt-1">
                                        Valor real: <span className="text-gray-400">${calculateRealValue(editingPackage.serviceIds)}</span>
                                        {calculateRealValue(editingPackage.serviceIds) > editingPackage.price && (
                                            <span className="text-green-400 ml-2">
                                                (Ahorro: ${calculateRealValue(editingPackage.serviceIds) - editingPackage.price})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea 
                                        value={editingPackage.description}
                                        onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                                        placeholder="Incluye..."
                                        className="bg-gray-950 border-gray-700 resize-none h-24"
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha: Selección de Servicios */}
                            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col h-full">
                                <Label className="mb-3 block">Servicios Incluidos</Label>
                                {availableServices.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-center text-xs text-gray-500 p-4 border border-dashed border-gray-800 rounded-lg">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Primero debes crear servicios en la sección anterior.
                                    </div>
                                ) : (
                                    <ScrollArea className="flex-1 h-[200px] pr-3">
                                        <div className="space-y-2">
                                            {availableServices.map(service => (
                                                <div 
                                                    key={service.id} 
                                                    className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors cursor-pointer ${editingPackage.serviceIds.includes(service.id) ? 'bg-purple-900/20 border-purple-500/50' : 'border-transparent hover:bg-gray-800'}`}
                                                    onClick={() => toggleServiceInPackage(service.id)}
                                                >
                                                    <Checkbox 
                                                        checked={editingPackage.serviceIds.includes(service.id)}
                                                        onCheckedChange={() => toggleServiceInPackage(service.id)}
                                                        className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">{service.name}</p>
                                                        <p className="text-xs text-gray-500">${service.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</Button>
                    <Button 
                        onClick={handleSave} 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={!editingPackage?.serviceIds.length || !editingPackage?.name || editingPackage.price <= 0}
                    >
                        Guardar Paquete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}