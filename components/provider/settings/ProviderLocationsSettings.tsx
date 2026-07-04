// Ubicación: src/components/provider/settings/ProviderLocationsSettings.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Plus, MapPin, Building2, CheckCircle2, AlertTriangle, Building } from "lucide-react";
import { useTranslations } from "next-intl";

import { useProviderLocations } from "@/hooks/useProviderLocations";
import { ProviderLocation, CreateLocationRequest } from "@/types/providerLocation";

// Componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from "@/components/ui/dialog";

// Tu LocationPicker (asegúrate de que la ruta sea correcta)
import EnhancedLocationPicker from "@/components/shared/location/MapModal";

export function ProviderLocationsSettings() {
 const t = useTranslations("ProviderSettings");
 const {
 locations,
 isLoading,
 isMutating,
 fetchLocations,
 createLocation,
 updateLocation,
 toggleLocation,
 } = useProviderLocations();

 // Estados para el Modal
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingLocation, setEditingLocation] = useState<ProviderLocation | null>(null);

 // Estados del Formulario
 const [formData, setFormData] = useState<CreateLocationRequest>({
 name: "",
 address: "",
 latitude: 0,
 longitude: 0,
 googlePlaceId: "",
 isMain: false,
 });

 // Cargar sedes al montar el componente
 useEffect(() => {
 fetchLocations();
 }, [fetchLocations]);

 // Manejador para abrir el modal (Crear o Editar)
 const openModal = (location?: ProviderLocation) => {
 if (location) {
 setEditingLocation(location);
 setFormData({
 name: location.name,
 address: location.address,
 latitude: location.latitude,
 longitude: location.longitude,
 googlePlaceId: location.googlePlaceId || "",
 isMain: location.isMain,
 });
 } else {
 setEditingLocation(null);
 setFormData({
 name: "",
 address: "",
 latitude: 0,
 longitude: 0,
 googlePlaceId: "",
 isMain: false, // Si es la primera, el backend lo forzará a true
 });
 }
 setIsModalOpen(true);
 };

 const handleCloseModal = () => {
 setIsModalOpen(false);
 setEditingLocation(null);
 };

 // Manejador del LocationPicker
 const handleLocationSelect = (locationData: any) => {
 setFormData((prev) => ({
 ...prev,
 address: locationData.address,
 latitude: locationData.lat,
 longitude: locationData.lng,
 googlePlaceId: locationData.placeId,
 }));
 };

 // Guardar (Crear o Actualizar)
 const handleSave = async () => {
 // Validación básica
 if (!formData.name.trim() || formData.latitude === 0) return;

 let success = false;
 if (editingLocation) {
 success = await updateLocation(editingLocation.id, formData);
 } else {
 success = await createLocation(formData);
 }

 if (success) {
 handleCloseModal();
 }
 };

 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-48">
 <QhSpinner size="lg" />
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header y Botón Agregar */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-tighter">
 Mis Sedes y Consultorios
 </h2>
 <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-bold">
 Gestiona dónde atiendes a tus pacientes presencialmente.
 </p>
 </div>
 <Button
 onClick={() => openModal()}
 disabled={locations.length >= 5 || isMutating}
 className="rounded-none bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-xs font-bold uppercase tracking-widest h-10 px-6"
 >
 <Plus className="w-4 h-4 mr-2" />
 Agregar Sede
 </Button>
 </div>

 {locations.length >= 5 && (
 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
 <div className="flex">
 <AlertTriangle className="h-5 w-5 text-yellow-400" />
 <p className="ml-3 text-sm text-yellow-700">
 Has alcanzado el límite máximo de 5 sedes permitidas.
 </p>
 </div>
 </div>
 )}

 {/* Lista de Tarjetas */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {locations.length === 0 ? (
 <div className="col-span-full py-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
 <Building className="mx-auto h-12 w-12 text-gray-400" />
 <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white uppercase">Sin sedes configuradas</h3>
 <p className="mt-1 text-xs text-gray-500">Agrega tu primer consultorio para habilitar citas presenciales.</p>
 </div>
 ) : (
 locations.map((loc) => (
 <div
 key={loc.id}
 className={`border p-5 bg-white dark:bg-slate-900 transition-colors relative ${
 loc.isMain ? "border-black dark:border-white" : "border-gray-200 dark:border-gray-800"
 }`}
 >
 <div className="flex justify-between items-start mb-4">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-full ${loc.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
 <Building2 className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
 {loc.name}
 </h3>
 {loc.isMain && (
 <span className="bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
 Principal
 </span>
 )}
 </div>
 <div className="flex items-center text-xs text-gray-500 mt-1">
 <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
 <span className="truncate max-w-[200px]">{loc.address}</span>
 </div>
 </div>
 </div>

 <div className="flex flex-col items-end gap-2">
 <Switch
 checked={loc.isActive}
 onCheckedChange={() => toggleLocation(loc.id)}
 disabled={isMutating}
 aria-label="Toggle Sede"
 />
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
 {loc.isActive ? 'Activa' : 'Inactiva'}
 </span>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
 <Button
 variant="ghost"
 onClick={() => openModal(loc)}
 disabled={isMutating}
 className="text-xs uppercase font-bold tracking-widest text-gray-500 hover:text-black dark:hover:text-white rounded-none"
 >
 Editar Detalles
 </Button>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Modal Agregar/Editar Sede */}
 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
 <DialogContent className="sm:max-w-[700px] p-0 rounded-none border-black dark:border-white gap-0">
 <div className="p-6 border-b border-gray-200 dark:border-gray-800">
 <DialogHeader>
 <DialogTitle className="text-xl font-bold uppercase tracking-tighter">
 {editingLocation ? "Editar Sede" : "Agregar Nueva Sede"}
 </DialogTitle>
 <DialogDescription className="text-xs uppercase tracking-widest font-medium">
 Configura los detalles de tu consultorio físico.
 </DialogDescription>
 </DialogHeader>
 </div>

 <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
 
 {/* Nombre y Principal */}
 <div className="flex flex-col sm:flex-row gap-6">
 <div className="flex-1 space-y-2">
 <Label className="text-xs font-bold uppercase tracking-widest">Nombre del Consultorio/Sede</Label>
 <Input
 placeholder="Ej: Consultorio Polanco, Torre Médica Sur..."
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="rounded-none border-gray-300 focus-visible:ring-black dark:focus-visible:ring-white"
 />
 </div>

 <div className="flex items-center space-x-2 pt-6">
 <Switch
 id="is-main-mode"
 checked={formData.isMain}
 onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
 disabled={editingLocation?.isMain} // No se puede quitar a sí mismo si ya es main
 />
 <Label htmlFor="is-main-mode" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
 Marcar como Sede Principal
 </Label>
 </div>
 </div>

 {/* Selector de Mapa */}
 <div className="space-y-2">
 <Label className="text-xs font-bold uppercase tracking-widest flex items-center justify-between">
 <span>Ubicación Exacta</span>
 {formData.latitude !== 0 && (
 <span className="flex items-center text-green-600 dark:text-green-400 normal-case text-[10px]">
 <CheckCircle2 className="w-3 h-3 mr-1" /> Ubicación capturada
 </span>
 )}
 </Label>
 <div className="h-[400px] border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 relative">
 <EnhancedLocationPicker
 onLocationSelect={handleLocationSelect}
 initialLocation={
 formData.latitude !== 0
 ? {
 lat: formData.latitude,
 lng: formData.longitude,
 address: formData.address,
 }
 : undefined
 }
 />
 </div>
 </div>

 </div>

 <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-slate-900/50">
 <Button
 variant="outline"
 onClick={handleCloseModal}
 disabled={isMutating}
 className="rounded-none text-xs font-bold uppercase tracking-widest border-gray-300"
 >
 Cancelar
 </Button>
 <Button
 onClick={handleSave}
 disabled={isMutating || !formData.name.trim() || formData.latitude === 0}
 className="rounded-none bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-xs font-bold uppercase tracking-widest"
 >
 {isMutating && <QhSpinner size="sm" className="mr-2" />}
 Guardar Sede
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 );
}