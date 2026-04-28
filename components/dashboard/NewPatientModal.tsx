import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { toast } from 'react-toastify';

export function NewPatientModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { createPatient, isSubmitting } = usePatientDirectory();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createPatient(formData);
        if (success) {
            onClose();
            setFormData({ firstName: '', lastName: '', email: '', phone: '' }); // Limpiar
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Paciente</DialogTitle>
                    <DialogDescription>Crea un expediente local para pacientes que no usan la app.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre *</label>
                            <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Apellido *</label>
                            <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Correo Electrónico</label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Teléfono</label>
                        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Guardar Paciente"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}