"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { supplierService } from '@/services/supplier.service';
import { UI_Supplier } from '@/types/catalog';
import { toast } from 'react-toastify';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function SuppliersPage() {
  const t = useTranslations('StoreHub');
  const [suppliers, setSuppliers] = useState<UI_Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<UI_Supplier>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await supplierService.getSuppliers(0, 100);
      setSuppliers(res.content);
    } catch (error) {
      toast.error('Error al cargar proveedores', { theme: 'colored' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.contactName && s.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSave = async () => {
    if (!editingSupplier.name) {
      toast.error('El nombre del proveedor es obligatorio', { theme: 'colored' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingSupplier.id) {
        await supplierService.updateSupplier(editingSupplier.id, editingSupplier);
        toast.success('Proveedor actualizado', { theme: 'colored' });
      } else {
        await supplierService.createSupplier(editingSupplier);
        toast.success('Proveedor creado', { theme: 'colored' });
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Error al guardar el proveedor', { theme: 'colored' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;
    
    try {
      await supplierService.deleteSupplier(id);
      toast.success('Proveedor eliminado', { theme: 'colored' });
      fetchSuppliers();
    } catch (error) {
      toast.error('Error al eliminar el proveedor', { theme: 'colored' });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-medical-50 text-medical-600 rounded-2xl border border-medical-100 shadow-inner">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Directorio de Proveedores
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Administra las empresas a las que compras tus insumos y productos.
            </p>
          </div>
        </div>
        <Button 
          className="bg-medical-600 hover:bg-medical-700 text-white shadow-md rounded-xl"
          onClick={() => { setEditingSupplier({}); setIsModalOpen(true); }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle>Listado de Proveedores</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar proveedor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><QhSpinner /></div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No se encontraron proveedores.
            </div>
          ) : (
            <div className="divide-y">
              {filteredSuppliers.map(supplier => (
                <div key={supplier.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h4 className="font-bold text-slate-900">{supplier.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      {supplier.contactName && <span>👤 {supplier.contactName}</span>}
                      {supplier.phone && <span>📞 {supplier.phone}</span>}
                      {supplier.email && <span>📧 {supplier.email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(supplier.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nombre de Empresa o Proveedor *</label>
              <Input 
                value={editingSupplier.name || ''} 
                onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })} 
                placeholder="Ej. Distribuidora Médica Nacional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nombre del Contacto</label>
              <Input 
                value={editingSupplier.contactName || ''} 
                onChange={(e) => setEditingSupplier({ ...editingSupplier, contactName: e.target.value })} 
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Teléfono</label>
                <Input 
                  value={editingSupplier.phone || ''} 
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} 
                  placeholder="Ej. 555-1234"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Correo Electrónico</label>
                <Input 
                  value={editingSupplier.email || ''} 
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })} 
                  placeholder="Ej. ventas@distribuidora.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="bg-medical-600 text-white" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Proveedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
