"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Building,
} from "lucide-react";

import { useProviderLocations } from "@/hooks/useProviderLocations";
import {
  ProviderLocation,
  CreateLocationRequest,
} from "@/types/providerLocation";

// Componentes UI de shadcn
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import EnhancedLocationPicker from "@/components/shared/location/MapModal";
import { cn } from "@/lib/utils";

export function ProviderLocationsSettings() {
  const t = useTranslations("ProviderSettings.Locations");
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
  const [editingLocation, setEditingLocation] =
    useState<ProviderLocation | null>(null);

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
        isMain: false,
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
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex items-center justify-center min-h-[350px]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── CABECERA Y BOTÓN DE ACCIÓN ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Building2 className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => openModal()}
          disabled={locations.length >= 5 || isMutating}
          className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{t("add_btn")}</span>
        </Button>
      </div>

      {/* ── ALERTA DE LÍMITE DE SEDES ─────────────────────────────────── */}
      {locations.length >= 5 && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-2xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2} />
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
            {t("limit_warning")}
          </p>
        </div>
      )}

      {/* ── LISTA DE SEDES / MATRIZ ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {locations.length === 0 ? (
          <div className="col-span-full py-12 px-4 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 mb-1 shadow-2xs">
              <Building className="h-6 w-6" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("empty_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className={cn(
                "rounded-3xl border transition-all duration-200 bg-white dark:bg-[#0a0a0a] p-6 shadow-2xs flex flex-col justify-between space-y-5 overflow-hidden",
                loc.isMain
                  ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
                  : "border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs",
                      loc.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                    )}
                  >
                    <Building2 className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-tight truncate">
                        {loc.name}
                      </h3>

                      {loc.isMain && (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                          {t("badge_main")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span className="truncate">{loc.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Switch
                    checked={loc.isActive}
                    onCheckedChange={() => toggleLocation(loc.id)}
                    disabled={isMutating}
                    aria-label="Alternar estado de Sede"
                  />
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase">
                    {loc.isActive ? t("status_active") : t("status_inactive")}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openModal(loc)}
                  disabled={isMutating}
                  className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] h-9 px-4 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  {t("btn_edit")}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODAL AGREGAR / EDITAR SEDE ───────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden font-sans shadow-2xl">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {editingLocation ? t("modal_edit_title") : t("modal_create_title")}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("modal_desc")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Nombre y Principal */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("label_name")}
                </Label>
                <Input
                  placeholder={t("placeholder_name")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-center space-x-2.5 sm:pb-2">
                <Switch
                  id="is-main-mode"
                  checked={formData.isMain}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isMain: checked })
                  }
                  disabled={editingLocation?.isMain}
                />
                <Label
                  htmlFor="is-main-mode"
                  className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer select-none"
                >
                  {t("label_is_main")}
                </Label>
              </div>
            </div>

            {/* Selector de Mapa */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                <span>{t("label_exact_location")}</span>
                {formData.latitude !== 0 && (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                    {t("location_captured")}
                  </span>
                )}
              </Label>

              <div className="h-[380px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] overflow-hidden relative shadow-2xs">
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

          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-[#050505]">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isMutating}
              className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-5 shadow-2xs cursor-pointer"
            >
              {t("btn_cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={
                isMutating || !formData.name.trim() || formData.latitude === 0
              }
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isMutating ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_saving")}</span>
                </>
              ) : (
                <span>{t("btn_save")}</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}