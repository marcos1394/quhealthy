/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { Service } from '@/app/quhealthy/types/marketplace'; // Asumiendo que este tipo existe

interface ServiceInPackage {
  serviceId: string;
  quantity: number;
}

interface PackageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packageData: any) => void;
  isLoading: boolean;
  availableServices: Service[];
  existingPackage?: any; // Para editar
}

export const PackageEditorModal: React.FC<PackageEditorModalProps> = ({
  isOpen, onClose, onSave, isLoading, availableServices, existingPackage
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [includedServices, setIncludedServices] = useState<ServiceInPackage[]>([]);

  useEffect(() => {
    if (existingPackage) {
      setName(existingPackage.name);
      setDescription(existingPackage.description);
      setPrice(existingPackage.price);
      setIncludedServices(existingPackage.servicesIncluded || []);
    } else {
      // Reset form for new package
      setName('');
      setDescription('');
      setPrice(0);
      setIncludedServices([]);
    }
  }, [existingPackage, isOpen]);

  const handleServiceChange = (index: number, field: 'serviceId' | 'quantity', value: string | number) => {
    const updated = [...includedServices];
    updated[index] = { ...updated[index], [field]: value };
    setIncludedServices(updated);
  };

  const addServiceSlot = () => {
    setIncludedServices([...includedServices, { serviceId: '', quantity: 1 }]);
  };

  const removeServiceSlot = (index: number) => {
    setIncludedServices(includedServices.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    const packageData = {
      name,
      description,
      price,
      servicesIncluded: includedServices.map(s => ({...s, serviceId: parseInt(s.serviceId)})), // Asegurar que serviceId sea número
      isActive: true
    };
    onSave(packageData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl"
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{existingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}</h2>
            <Button variant="ghost" size="default" onClick={onClose}><X/></Button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Paquete</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="price">Precio Total ($)</Label>
                <Input id="price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Servicios Incluidos</h3>
              <div className="space-y-3">
                {includedServices.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={item.serviceId} onValueChange={val => handleServiceChange(index, 'serviceId', val)}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un servicio..." /></SelectTrigger>
                      <SelectContent>
                        {availableServices.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Cant." value={item.quantity} onChange={e => handleServiceChange(index, 'quantity', parseInt(e.target.value))} className="w-24" />
                    <Button variant="destructive" size="default" onClick={() => removeServiceSlot(index)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addServiceSlot} className="border-dashed border-gray-600"><Plus className="w-4 h-4 mr-2"/>Añadir Servicio</Button>
              </div>
            </div>
          </div>
          <div className="p-6 flex justify-end gap-3 border-t border-gray-700 bg-gray-800/50">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Guardar Paquete'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};