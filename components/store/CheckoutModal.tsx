// Ubicación: src/components/store/CheckoutModal.tsx
"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, FileText, Upload, X, CheckCircle2,
  Loader2, MapPin, ShieldCheck, AlertCircle, Store, Zap, MonitorPlay, Calendar as CalendarIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StorefrontItem } from "@/types/storefront";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import { storageService } from "@/services/storage.service"; // 🚀 Añadido el servicio de Storage

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: StorefrontItem[];
  // 🚀 FIX: prescriptionUrls ahora es de tipo string (JSON) para que encaje con el Hook
  onConfirm: (shippingAddress: string | undefined, prescriptionUrls: string | undefined, pickupTime: string | undefined) => void;
  isProcessing: boolean;
  themeColor?: string;
}

interface AddressForm {
  street: string;
  colony: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_ADDRESS: AddressForm = { street: "", colony: "", city: "", state: "", zip: "" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildAddressString(f: AddressForm): string {
  return `${f.street}, Col. ${f.colony}, CP ${f.zip}, ${f.city}, ${f.state}`.trim();
}

function isAddressComplete(f: AddressForm): boolean {
  return !!(f.street && f.colony && f.city && f.state && f.zip);
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CheckoutModal({
  isOpen, onClose, cart, onConfirm, isProcessing, themeColor = "#7c3aed"
}: CheckoutModalProps) {
  // --- Derived flags ---
  const hasPhysical = cart.some(i => i.type === 'PRODUCT' && i.isDigital !== true);
  const itemsNeedingRx = cart.filter(i => i.type === 'PRODUCT' && i.requiresPrescription === true);
  const needsPrescription = itemsNeedingRx.length > 0;

  // --- State ---
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [prescriptionUrls, setPrescriptionUrls] = useState<Record<number, string>>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [shippingMethod, setShippingMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY'); // 🚀 Toggle de envío
  
  // 🚀 Nuevos estados para fecha y hora de recolección en sitio
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTimeStr, setPickupTimeStr] = useState<string>('');

  const PICKUP_TIMES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const { setQuery, suggestions, setSuggestions, isLoading: isAutocompleteLoading } = useGoogleAutocomplete();

  // --- Derived: can submit? ---
  const addressOk  = !hasPhysical || (shippingMethod === 'PICKUP' && pickupDate && pickupTimeStr) || (shippingMethod === 'DELIVERY' && isAddressComplete(address));
  const rxOk       = !needsPrescription || itemsNeedingRx.every(i => !!prescriptionUrls[i.id]);
  const canSubmit  = addressOk && rxOk && !isProcessing;

  // --- Handlers ---
  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (field === 'street') {
      setQuery(value);
    }
  };

  const handleSelectSuggestion = async (placeId: string, description: string) => {
    setQuery('');
    setSuggestions([]);
    
    const parts = description.split(',').map(p => p.trim());
    
    let street = '';
    let colony = '';
    let city = '';
    let state = '';
    let zip = ''; 

    if (parts.length > 0) {
      street = parts[0];
    }

    if (parts.length >= 5) {
      colony = parts[1];
      city = parts[parts.length - 3];
      state = parts[parts.length - 2];
    } else if (parts.length === 4) {
      city = parts[1];
      state = parts[2];
    } else if (parts.length === 3) {
      city = parts[0];
      state = parts[1];
      street = ''; 
    }

    setAddress({
      street: street,
      colony: colony,
      city: city,
      state: state,
      zip: zip,
    });
  };

  // 🚀 LÓGICA DIRECT-TO-CLOUD PARA LA RECETA
  const handleFileChange = async (itemId: number, file: File | null) => {
    if (!file) return;
    setUploadingId(itemId);
    setUploadErrors(prev => ({ ...prev, [itemId]: "" }));
    
    try {
      // 1. Pedimos la Signed URL a nuestro backend (Java)
      const { signedUrl, fileKey } = await storageService.getPrescriptionUploadUrl(file.type);

      // 2. Subimos el archivo a Google Cloud usando fetch y el verbo PUT
      await storageService.uploadDirectToCloud(file, signedUrl);

      // 3. Guardamos el 'fileKey' interno de Google Cloud en nuestro estado local
      setPrescriptionUrls(prev => ({ ...prev, [itemId]: fileKey }));
      
    } catch (error) {
      console.error(error);
      setUploadErrors(prev => ({ ...prev, [itemId]: "Error al subir a la nube. Intenta de nuevo." }));
    } finally {
      setUploadingId(null);
    }
  };

  const handleConfirm = () => {
    const finalShippingAddress = hasPhysical 
      ? (shippingMethod === 'PICKUP' ? 'PICKUP' : buildAddressString(address)) 
      : undefined;
    
    // 🚀 Transformamos el objeto de recetas a un String JSON para el Backend
    const finalPrescriptionUrls = Object.keys(prescriptionUrls).length > 0 
      ? JSON.stringify(prescriptionUrls) 
      : undefined;

    // 🚀 Formateamos la fecha y hora a ISO String si aplica
    const finalPickupTime = shippingMethod === 'PICKUP' && pickupDate && pickupTimeStr 
      ? `${format(pickupDate, "yyyy-MM-dd")}T${pickupTimeStr}:00` 
      : undefined;

    onConfirm(finalShippingAddress, finalPrescriptionUrls, finalPickupTime);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full sm:max-w-xl bg-white dark:bg-[#18181b] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[92dvh] flex flex-col"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Finalizar Pedido</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                {[hasPhysical && "Dirección de envío", needsPrescription && "Receta médica"]
                  .filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">

            {/* ── SECCIÓN 0: PRODUCTOS DIGITALES (SI TODO ES DIGITAL) ──────────────── */}
            {!hasPhysical && !needsPrescription && (
              <section className="py-2">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                    <MonitorPlay className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acceso a Contenido Digital</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                      Estás a un paso de acceder a tu contenido. Al confirmar el pago, se habilitará inmediatamente en tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/10 overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MonitorPlay className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 line-clamp-1">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-none whitespace-nowrap">
                        100% Digital
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Acceso Inmediato</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Pago Seguro</span>
                  </div>
                </div>
              </section>
            )}

            {/* ── SECCIÓN 1: DIRECCIÓN DE ENVÍO ──────────────────────────── */}
            {hasPhysical && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20">
                    <Truck className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">¿A dónde enviamos tu paquete?</h3>
                    <p className="text-xs text-slate-400">Los siguientes artículos son físicos y requieren envío.</p>
                  </div>
                </div>

                {/* Items físicos */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cart.filter(i => !i.isDigital).map(i => (
                    <Badge key={i.id} className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border-none text-xs">
                      {i.name}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div 
                    className={cn(
                      "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2",
                      shippingMethod === 'DELIVERY' ? "border-medical-500 bg-medical-50 dark:bg-medical-500/10" : "border-slate-200 dark:border-slate-800 hover:border-medical-300"
                    )}
                    onClick={() => setShippingMethod('DELIVERY')}
                  >
                    <Truck className={cn("w-5 h-5", shippingMethod === 'DELIVERY' ? "text-medical-600" : "text-slate-400")} />
                    <span className={cn("font-semibold text-sm", shippingMethod === 'DELIVERY' ? "text-medical-700 dark:text-medical-300" : "text-slate-600 dark:text-slate-400")}>Envío a domicilio</span>
                  </div>
                  <div 
                    className={cn(
                      "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2",
                      shippingMethod === 'PICKUP' ? "border-medical-500 bg-medical-50 dark:bg-medical-500/10" : "border-slate-200 dark:border-slate-800 hover:border-medical-300"
                    )}
                    onClick={() => setShippingMethod('PICKUP')}
                  >
                    <Store className={cn("w-5 h-5", shippingMethod === 'PICKUP' ? "text-medical-600" : "text-slate-400")} />
                    <span className={cn("font-semibold text-sm", shippingMethod === 'PICKUP' ? "text-medical-700 dark:text-medical-300" : "text-slate-600 dark:text-slate-400")}>Recoger en Clínica</span>
                  </div>
                </div>

                {/* Formulario */}
                <AnimatePresence>
                  {shippingMethod === 'DELIVERY' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                      <div className="relative">
                    <InputField
                      label="Calle y número"
                      placeholder="Av. Siempre Viva 742"
                      value={address.street}
                      onChange={v => handleAddressChange("street", v)}
                      icon={isAutocompleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    />
                    
                    {/* Autocomplete Suggestions */}
                    <AnimatePresence>
                      {suggestions.length > 0 && address.street.length > 2 && (
                        <motion.ul 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {suggestions.map((sug) => (
                            <li 
                              key={sug.place_id}
                              onClick={() => handleSelectSuggestion(sug.place_id, sug.description)}
                              className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-3 transition-colors"
                            >
                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <span className="leading-tight">{sug.description}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Colonia" placeholder="Centro" value={address.colony} onChange={v => handleAddressChange("colony", v)} />
                    <InputField label="Código Postal" placeholder="81200" value={address.zip} onChange={v => handleAddressChange("zip", v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Ciudad" placeholder="Los Mochis" value={address.city} onChange={v => handleAddressChange("city", v)} />
                    <InputField label="Estado" placeholder="Sinaloa" value={address.state} onChange={v => handleAddressChange("state", v)} />
                  </div>
                    </motion.div>
                  )}

                  {/* Formulario PICKUP (Fecha y Hora) */}
                  {shippingMethod === 'PICKUP' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                      <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 text-xs text-medical-700 dark:text-medical-300">
                        Selecciona el día y la hora aproximada en la que pasarás a la clínica a recoger tu producto.
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Fecha de Recolección</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-sm py-2.5 h-auto",
                                  !pickupDate && "text-slate-400 dark:text-zinc-500"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pickupDate ? format(pickupDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                              <Calendar
                                mode="single"
                                selected={pickupDate}
                                onSelect={setPickupDate}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Hora Aproximada</label>
                          <Select value={pickupTimeStr} onValueChange={setPickupTimeStr}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl py-2.5 h-auto text-sm">
                              <SelectValue placeholder="Seleccionar hora" />
                            </SelectTrigger>
                            <SelectContent className="max-h-48 z-[100]">
                              {PICKUP_TIMES.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time} hrs
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview dirección */}
                {shippingMethod === 'DELIVERY' && isAddressComplete(address) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-snug">
                      {buildAddressString(address)}
                    </p>
                  </motion.div>
                )}
              </section>
            )}

            {/* ── SECCIÓN 2: RECETAS MÉDICAS ─────────────────────────────── */}
            {needsPrescription && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                    <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Receta Médica Requerida</h3>
                    <p className="text-xs text-slate-400">Por regulación, necesitamos verificar tu receta.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {itemsNeedingRx.map(item => {
                    const uploaded = !!prescriptionUrls[item.id];
                    const isUploading = uploadingId === item.id;
                    const error = uploadErrors[item.id];

                    return (
                      <div key={item.id} className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name}</p>
                            {item.activeIngredient && (
                              <p className="text-xs text-slate-400">{item.activeIngredient}</p>
                            )}
                          </div>
                          {uploaded && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-none text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Receta protegida
                            </Badge>
                          )}
                        </div>

                        {/* Drop zone */}
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[item.id]?.click()}
                          disabled={isUploading}
                          className={cn(
                            "w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-all",
                            uploaded
                              ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/5"
                              : "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 hover:border-amber-400 dark:hover:border-amber-400/60",
                            "cursor-pointer"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                          ) : uploaded ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <Upload className="w-6 h-6 text-amber-500" />
                          )}
                          <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                            {isUploading
                              ? "Cifrando y subiendo receta..."
                              : uploaded
                                ? "Cambiar imagen de receta"
                                : "Toca para subir una foto de tu receta"}
                          </span>
                          <span className="text-[10px] text-slate-400">JPG, PNG o PDF · Máx. 5 MB</span>
                        </button>

                        {/* Hidden input */}
                        <input
                          ref={el => { fileInputRefs.current[item.id] = el; }}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={e => handleFileChange(item.id, e.target.files?.[0] ?? null)}
                        />

                        {error && (
                          <p className="text-xs text-rose-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Tu receta será cifrada de extremo a extremo. Solo la verá el especialista para validar tu compra.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Footer CTA */}
          <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button
              onClick={handleConfirm}
              disabled={!canSubmit}
              className="w-full h-12 text-base font-bold text-white rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: themeColor }}
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando pago...</>
              ) : (
                "Ir al Pago →"
              )}
            </Button>

            {/* Validation hints */}
            {!addressOk && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                Completa la dirección de envío para continuar.
              </p>
            )}
            {!rxOk && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                Sube la(s) receta(s) médica(s) requeridas para continuar.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sub-component: simple labeled input ──────────────────────────────────────
function InputField({
  label, placeholder, value, onChange, icon,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10",
            "rounded-xl py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400",
            "outline-none focus:ring-2 focus:ring-violet-500/30 transition-all",
            icon ? "pl-9 pr-4" : "px-4"
          )}
        />
      </div>
    </div>
  );
}
