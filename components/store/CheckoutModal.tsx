"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-noninteractive-element-interactions */
/* eslint-disable react-doctor/no-giant-component */;
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Truck, FileText, Upload, X, CheckCircle2,
 Loader2, MapPin, ShieldCheck, AlertCircle, Store, Zap, MonitorPlay, Calendar as CalendarIcon, Package
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorefrontItem } from "@/types/storefront";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import { storageService } from "@/services/storage.service"; 

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePicker } from "@/components/ui/date-picker";
import { useBookingStore } from "@/hooks/useBookingStore";
import { consumerWalletService } from "@/services/consumer-wallet.service";
import { CreditCard, Wallet } from "lucide-react";
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
 onConfirm: (shippingAddress: string | undefined, prescriptionUrls: string | undefined, pickupTime: string | undefined, destinationState: string | undefined, paymentMethod: string) => void;
 isProcessing: boolean;
 themeColor?: string; // providerColor
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
 isOpen, onClose, cart, onConfirm, isProcessing, themeColor = "#000000"
}: CheckoutModalProps) {
 const { updateQuantity, removeFromCart } = useBookingStore();
 const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'WALLET_BALANCE'>('CREDIT_CARD');

  // Fetch Wallet Balance
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const fetchWallet = async () => {
        setIsLoadingWallet(true);
        try {
          const data = await consumerWalletService.getMyWallet();
          if (isMounted) setWalletBalance(data.balance || 0);
        } catch (error) {
          console.warn("Could not fetch wallet balance:", error);
        } finally {
          if (isMounted) setIsLoadingWallet(false);
        }
      };
      fetchWallet();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

 // --- Derived flags ---
 const hasPhysical = cart.some(i => i.type === 'PRODUCT' && i.isDigital !== true);
 const itemsNeedingRx = cart.filter(i => i.type === 'PRODUCT' && i.requiresPrescription === true);
 const needsPrescription = itemsNeedingRx.length > 0;
 
 const hasPackage = cart.some(i => i.type === 'PACKAGE');
 const hasService = cart.some(i => i.type === 'SERVICE');
 const isBooking = hasPackage || hasService;

 // --- State ---
 const [{ address, prescriptionUrls, uploadingId, uploadErrors, shippingMethod, pickupDate, pickupTimeStr }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_ADDRESS': return { ...state, address: typeof action.payload === 'function' ? action.payload(state.address) : action.payload };
 case 'SET_PRESCRIPTIONURLS': return { ...state, prescriptionUrls: typeof action.payload === 'function' ? action.payload(state.prescriptionUrls) : action.payload };
 case 'SET_UPLOADINGID': return { ...state, uploadingId: typeof action.payload === 'function' ? action.payload(state.uploadingId) : action.payload };
 case 'SET_UPLOADERRORS': return { ...state, uploadErrors: typeof action.payload === 'function' ? action.payload(state.uploadErrors) : action.payload };
 case 'SET_SHIPPINGMETHOD': return { ...state, shippingMethod: typeof action.payload === 'function' ? action.payload(state.shippingMethod) : action.payload };
 case 'SET_PICKUPDATE': return { ...state, pickupDate: typeof action.payload === 'function' ? action.payload(state.pickupDate) : action.payload };
 case 'SET_PICKUPTIMESTR': return { ...state, pickupTimeStr: typeof action.payload === 'function' ? action.payload(state.pickupTimeStr) : action.payload };
 default: return state;
 }
 },
 {
 address: EMPTY_ADDRESS, prescriptionUrls: {}, uploadingId: null, uploadErrors: {}, shippingMethod: 'DELIVERY', pickupDate: undefined, pickupTimeStr: ''
 }
 );

 const setAddress = (val: any) => dispatch({ type: 'SET_ADDRESS', payload: val });
 const setPrescriptionUrls = (val: any) => dispatch({ type: 'SET_PRESCRIPTIONURLS', payload: val });
 const setUploadingId = (val: any) => dispatch({ type: 'SET_UPLOADINGID', payload: val });
 const setUploadErrors = (val: any) => dispatch({ type: 'SET_UPLOADERRORS', payload: val });
 const setShippingMethod = (val: any) => dispatch({ type: 'SET_SHIPPINGMETHOD', payload: val });
 const setPickupDate = (val: any) => dispatch({ type: 'SET_PICKUPDATE', payload: val });
 const setPickupTimeStr = (val: any) => dispatch({ type: 'SET_PICKUPTIMESTR', payload: val });

 const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
 
 const PICKUP_TIMES = [
 "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
 "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
 "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
 ];

 const { setQuery, suggestions, setSuggestions, isLoading: isAutocompleteLoading } = useGoogleAutocomplete();
 const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.cartQuantity || 1)), 0);

 // --- Derived: can submit? ---
 const addressOk = !hasPhysical || (shippingMethod === 'PICKUP' && pickupDate && pickupTimeStr) || (shippingMethod === 'DELIVERY' && isAddressComplete(address));
 const rxOk = !needsPrescription || itemsNeedingRx.every(i => !!prescriptionUrls[i.id]);
 const paymentOk = paymentMethod === 'CREDIT_CARD' || (paymentMethod === 'WALLET_BALANCE' && walletBalance >= totalAmount);
 const canSubmit = addressOk && rxOk && paymentOk && !isProcessing;

 // --- Handlers ---
 const handleAddressChange = (field: keyof AddressForm, value: string) => {
 setAddress((prev: any) => ({ ...prev, [field]: value }));
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

 if (parts.length > 0) street = parts[0];
 if (parts.length >= 5) { colony = parts[1]; city = parts[parts.length - 3]; state = parts[parts.length - 2]; }
 else if (parts.length === 4) { city = parts[1]; state = parts[2]; }
 else if (parts.length === 3) { city = parts[0]; state = parts[1]; }

 setAddress({ street, colony, city, state, zip });
 };

 const handleFileChange = async (itemId: number, file: File | null) => {
 if (!file) return;
 setUploadingId(itemId);
 setUploadErrors((prev: any) => ({ ...prev, [itemId]: "" }));
 
 try {
 const { signedUrl, fileKey } = await storageService.getPrescriptionUploadUrl(file.type);
 await storageService.uploadDirectToCloud(file, signedUrl);
 setPrescriptionUrls((prev: any) => ({ ...prev, [itemId]: fileKey }));
 } catch (error) {
 console.error(error);
 setUploadErrors((prev: any) => ({ ...prev, [itemId]: "ERROR DE TRANSFERENCIA. REINTENTE." }));
 } finally {
 setUploadingId(null);
 }
 };

 const handleConfirm = () => {
 const finalShippingAddress = hasPhysical ? (shippingMethod === 'PICKUP' ? 'PICKUP' : buildAddressString(address)) : undefined;
 const finalPrescriptionUrls = Object.keys(prescriptionUrls).length > 0 ? JSON.stringify(prescriptionUrls) : undefined;
 const finalPickupTime = shippingMethod === 'PICKUP' && pickupDate && pickupTimeStr ? `${format(pickupDate, "yyyy-MM-dd")}T${pickupTimeStr}:00` : undefined;
 const finalDestinationState = hasPhysical && shippingMethod === 'DELIVERY' ? address.state : undefined;
 onConfirm(finalShippingAddress, finalPrescriptionUrls, finalPickupTime, finalDestinationState, paymentMethod);
 };

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <motion.div
 className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6"
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 >
 {/* Backdrop Rigoroso */}
 <motion.div
 className="absolute inset-0 bg-black/40 backdrop-blur-sm"
 onClick={onClose}
 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 />

 {/* Panel Blueprint */}
  <motion.div
  className="relative z-10 w-full sm:max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col shadow-2xl max-h-[90vh] overflow-hidden"
  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
  {/* Header Editorial */}
  <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex-shrink-0">
  <div>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
  {hasPhysical ? "Finalización de Pedido" : (isBooking ? "Confirmación de Reserva" : "Finalización de Contrato")}
  </h2>
  <p className="text-xs font-medium text-gray-500">
  {[hasPhysical && "Logística", needsPrescription && "Validación Clínica"]
  .filter(Boolean).join(" · ")}
  </p>
  </div>
  <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
  <X className="w-5 h-5" strokeWidth={2} />
  </button>
  </div>

 {/* Scrollable content */}
 <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-12 custom-scrollbar">

 {/* ── SECCIÓN 0: ORDER SUMMARY (SIEMPRE VISIBLE) ──────────────── */}
 <section className="py-2">
  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488', color: '#ffffff' }}>
  <Package className="w-5 h-5" strokeWidth={2} />
  </div>
  <div>
  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Resumen de Ítems</h3>
  <p className="text-xs text-gray-500">Verifique el contenido de su orden antes de liquidar.</p>
  </div>
  </div>

  <div className="space-y-4 mb-10">
  {cart.map((item, idx) => (
  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
  <div className="flex items-center gap-4 min-w-0 flex-1">
  <div className="w-14 h-14 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black flex-shrink-0 flex items-center justify-center overflow-hidden relative">
  {item.imageUrl && (
  // eslint-disable-next-line @next/next/no-img-element
  <img 
  src={item.imageUrl} 
  alt={item.name} 
  className="absolute inset-0 w-full h-full object-cover transition-all z-10 bg-gray-50 dark:bg-black" 
  onError={(e) => {
  e.currentTarget.style.opacity = '0';
  }}
  />
  )}
  <div className="absolute inset-0 flex items-center justify-center z-0">
  {item.type === 'PACKAGE' ? <Package className="w-5 h-5 text-gray-400" strokeWidth={1.5} /> : (item.type === 'SERVICE' ? <CalendarIcon className="w-5 h-5 text-gray-400" strokeWidth={1.5} /> : <MonitorPlay className="w-5 h-5 text-gray-400" strokeWidth={1.5} />)}
  </div>
  </div>
  <div className="flex flex-col">
  <span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
  {item.name}
  </span>
  <span className="text-xs font-medium" style={{ color: themeColor !== '#ffffff' ? themeColor : '#0d9488' }}>
  {item.type === 'PACKAGE' ? 'Paquete' : (item.type === 'SERVICE' ? 'Servicio' : (item.isDigital ? 'Digital' : 'Físico'))}
  </span>
  </div>
  </div>

  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
  {/* Control Cuantitativo */}
  {item.type === 'PRODUCT' ? (
  <div className="flex items-center h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] overflow-hidden">
  <button 
  onClick={() => {
  if (item.cartQuantity && item.cartQuantity > 1) {
  updateQuantity(item.id, item.cartQuantity - 1);
  } else {
  removeFromCart(item.id);
  }
  }}
  className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
  -
  </button>
  <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">
  {item.cartQuantity || 1}
  </span>
  <button 
  onClick={() => updateQuantity(item.id, (item.cartQuantity || 1) + 1)}
  className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
  +
  </button>
  </div>
  ) : (
  <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
  1x
  </span>
  )}

  {/* Subtotal del Item */}
  <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white min-w-[80px] text-right">
  ${((item.price) * (item.cartQuantity || 1)).toLocaleString()}
  </span>
  </div>
  </div>
  ))}
  </div>
 </section>

 {/* ── SECCIÓN 1: DIRECCIÓN DE ENVÍO ──────────────────────────── */}
 {hasPhysical && (
 <section>
  <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488', color: '#ffffff' }}>
  <Truck className="w-5 h-5" strokeWidth={2} />
  </div>
  <div>
  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Parámetros de Logística</h3>
  <p className="text-xs text-gray-500">Defina el método de entrega para ítems físicos.</p>
  </div>
  </div>

  <div className="flex gap-4 mb-8">
  <button 
  className={cn(
  "flex-1 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all border font-semibold text-sm shadow-sm",
  shippingMethod === 'DELIVERY' ? "border-transparent text-white" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
  )}
  style={shippingMethod === 'DELIVERY' ? { backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488' } : {}}
  onClick={() => setShippingMethod('DELIVERY')}
  >
  <Truck className="w-5 h-5" strokeWidth={shippingMethod === 'DELIVERY' ? 2 : 1.5} /> Domicilio
  </button>
  <button 
  className={cn(
  "flex-1 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all border font-semibold text-sm shadow-sm",
  shippingMethod === 'PICKUP' ? "border-transparent text-white" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
  )}
  style={shippingMethod === 'PICKUP' ? { backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488' } : {}}
  onClick={() => setShippingMethod('PICKUP')}
  >
  <Store className="w-5 h-5" strokeWidth={shippingMethod === 'PICKUP' ? 2 : 1.5} /> In-Situ
  </button>
  </div>

 {/* Formulario */}
 <AnimatePresence mode="wait">
 {shippingMethod === 'DELIVERY' && (
 <motion.div key="delivery" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
 <div className="relative">
 <InputField
 label="Calle y Número"
 placeholder="AV. CENTRAL 123"
 value={address.street}
 onChange={v => handleAddressChange("street", v)}
 icon={isAutocompleteLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <MapPin className="w-4 h-4 text-gray-400" />}
 />
 
 {/* Autocomplete Suggestions */}
 <AnimatePresence>
 {suggestions.length > 0 && address.street.length > 2 && (
 <motion.ul 
 initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
 className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-60 overflow-y-auto rounded-xl custom-scrollbar"
 >
 {suggestions.map((sug) => (
 <li 
 key={sug.place_id}
 onClick={() => handleSelectSuggestion(sug.place_id, sug.description)}
 className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 flex items-start gap-3 transition-colors"
 >
 <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" strokeWidth={1.5} />
 <span className="leading-relaxed">{sug.description}</span>
 </li>
 ))}
 </motion.ul>
 )}
 </AnimatePresence>
 </div>
 <div className="grid grid-cols-2 gap-6">
 <InputField label="Colonia" placeholder="CENTRO" value={address.colony} onChange={v => handleAddressChange("colony", v)} />
 <InputField label="Código Postal" placeholder="81200" value={address.zip} onChange={v => handleAddressChange("zip", v)} />
 </div>
 <div className="grid grid-cols-2 gap-6">
 <InputField label="Ciudad" placeholder="LOS MOCHIS" value={address.city} onChange={v => handleAddressChange("city", v)} />
 <InputField label="Estado" placeholder="SINALOA" value={address.state} onChange={v => handleAddressChange("state", v)} />
 </div>
 </motion.div>
 )}

 {/* Formulario PICKUP */}
 {shippingMethod === 'PICKUP' && (
 <motion.div key="pickup" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
 <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900 rounded-xl text-xs font-medium text-teal-800 dark:text-teal-200">
 INDIQUE EL BLOQUE TEMPORAL PARA SU RECOLECCIÓN.
 </div>
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">Fecha Programada</label>
 <DatePicker
 value={pickupDate}
 onChange={setPickupDate}
 disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6}
 placeholder="DD/MM/AAAA"
 className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] h-12"
 popoverClassName="z-[100] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
 />
 </div>
 <div>
 <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">Horario</label>
 <Select value={pickupTimeStr} onValueChange={setPickupTimeStr}>
 <SelectTrigger className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] h-12 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
 <SelectValue placeholder="HH:MM" />
 </SelectTrigger>
 <SelectContent className="max-h-64 z-[100] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
 {PICKUP_TIMES.map((time) => (
 <SelectItem key={time} value={time} className="text-sm font-medium cursor-pointer">
 {time} HRS
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
 className="mt-8 p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3"
 >
 <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" strokeWidth={2} />
 <p className="text-xs font-medium text-gray-900 dark:text-white leading-relaxed">
 {buildAddressString(address)}
 </p>
 </motion.div>
 )}
 </section>
 )}

 {/* ── SECCIÓN 2: RECETAS MÉDICAS ─────────────────────────────── */}
 {needsPrescription && (
 <section className="pt-4">
 <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488', color: '#ffffff' }}>
 <ShieldCheck className="w-5 h-5" strokeWidth={2} />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Auditoría de Prescripción</h3>
 <p className="text-xs text-gray-500">Documentación Clínica Obligatoria.</p>
 </div>
 </div>

 <div className="space-y-4">
 {itemsNeedingRx.map(item => {
 const uploaded = !!prescriptionUrls[item.id];
 const isUploading = uploadingId === item.id;
 const error = uploadErrors[item.id];

 return (
 <div key={item.id} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
 <div>
 <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.name}</p>
 {item.activeIngredient && (
 <p className="text-xs font-medium text-gray-500">ACTIVO: {item.activeIngredient}</p>
 )}
 </div>
 {uploaded && (
 <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit bg-teal-50 text-teal-700 border border-teal-100">
 <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> Verificada
 </span>
 )}
 </div>

 <button
 type="button"
 onClick={() => fileInputRefs.current[item.id]?.click()}
 disabled={isUploading}
 className={cn(
 "w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all",
 uploaded
 ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a0a0a]"
 : "border-gray-300 dark:border-gray-600 bg-white dark:bg-black hover:border-teal-500",
 "cursor-pointer"
 )}
 >
 {isUploading ? (
 <Loader2 className="w-6 h-6 animate-spin text-teal-600" strokeWidth={2} />
 ) : uploaded ? (
 <CheckCircle2 className="w-6 h-6 text-teal-600" strokeWidth={2} />
 ) : (
 <Upload className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 )}
 
 <span className="text-xs font-bold text-gray-900 dark:text-white text-center">
 {isUploading
 ? "Procesando..."
 : uploaded
 ? "Reemplazar archivo"
 : "Adjuntar documento clínico"}
 </span>
 <span className="text-[10px] text-gray-400">PDF, JPG, PNG · Límite: 5 MB</span>
 </button>

 <input
 ref={el => { fileInputRefs.current[item.id] = el; }}
 type="file"
 accept="image/*,application/pdf"
 className="hidden"
 onChange={e => handleFileChange(item.id, e.target.files?.[0] ?? null)}
 />

 {error && (
 <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center gap-3 text-xs font-medium text-red-600 dark:text-red-400">
 <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {error}
 </div>
 )}
 </div>
 );
 })}
 </div>

 <div className="mt-8 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900 flex items-start gap-3">
 <FileText className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" strokeWidth={1.5} />
 <p className="text-xs font-medium text-teal-900 dark:text-teal-200 leading-relaxed">
 La receta será cifrada. Uso exclusivo para auditoría de dispensación por parte del especialista.
 </p>
 </div>
 </section>
 )}

 {/* ── SECCIÓN DE PAGO ─────────────────────────────── */}
 <section className="pt-4">
 <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488', color: '#ffffff' }}>
 <CreditCard className="w-5 h-5" strokeWidth={2} />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Método de Pago</h3>
 <p className="text-xs text-gray-500">Seleccione la fuente de fondos.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <button
 onClick={() => setPaymentMethod('CREDIT_CARD')}
 className={cn(
 "p-5 rounded-2xl border flex flex-col items-start gap-3 transition-all relative text-left",
 paymentMethod === 'CREDIT_CARD' 
 ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10" 
 : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] hover:border-gray-300"
 )}
 >
 <CreditCard className={cn("w-6 h-6", paymentMethod === 'CREDIT_CARD' ? "text-teal-600" : "text-gray-400")} strokeWidth={1.5} />
 <span className="text-xs font-bold text-gray-900 dark:text-white">Tarjeta / Stripe</span>
 <span className="text-[10px] text-gray-500">Pago externo seguro</span>
 </button>

 <button
 onClick={() => { if (walletBalance >= totalAmount) setPaymentMethod('WALLET_BALANCE'); }}
 disabled={walletBalance < totalAmount}
 className={cn(
 "p-5 rounded-2xl border flex flex-col items-start gap-3 transition-all relative text-left",
 paymentMethod === 'WALLET_BALANCE' 
 ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10" 
 : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] hover:border-gray-300 disabled:opacity-50"
 )}
 >
 <Wallet className={cn("w-6 h-6", paymentMethod === 'WALLET_BALANCE' ? "text-teal-600" : "text-gray-400")} strokeWidth={1.5} />
 <div className="flex flex-col">
 <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
 QuWallet {isLoadingWallet && <Loader2 className="w-3 h-3 animate-spin" />}
 </span>
 <span className="text-[10px] text-gray-500">Saldo: ${walletBalance.toLocaleString()} MXN</span>
 </div>
 {walletBalance < totalAmount && (
 <span className="text-[10px] font-bold text-red-500">Saldo insuficiente</span>
 )}
 </button>
 </div>
 </section>
 </div>

 {/* Footer CTA */}
  <div className="flex-shrink-0 p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.05)] relative z-20">
  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
  <span className="text-sm font-semibold text-gray-500">
  Liquidación Total
  </span>
  <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
  ${totalAmount.toLocaleString()} <span className="text-base font-medium text-gray-400">MXN</span>
  </span>
  </div>
  <Button
  onClick={handleConfirm}
  disabled={!canSubmit}
  className="w-full rounded-xl text-sm font-bold uppercase tracking-widest border-0 transition-all shadow-md hover:shadow-lg disabled:opacity-50 h-14"
  style={(!canSubmit) ? {} : { backgroundColor: themeColor !== '#ffffff' ? themeColor : '#0d9488', color: '#ffffff' }}
  >
  {isProcessing ? (
  <><Loader2 className="w-5 h-5 mr-3 animate-spin" strokeWidth={2.5} /> Procesando...</>
  ) : (
  "Pagar de forma segura"
  )}
  </Button>
 </div>
 </motion.div>
 </motion.div>
 </AnimatePresence>
 );
}

// ── Sub-component: InputField Blueprint ──────────────────────────────────────
function InputField({
 label, placeholder, value, onChange, icon,
}: {
 label: string; placeholder: string; value: string;
 onChange: (v: string) => void; icon?: React.ReactNode;
}) {
 return (
 <div className="space-y-2">
 <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">{label}</label>
 <div className="relative">
 {icon && (
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
 {icon}
 </div>
 )}
 <input
 type="text"
 placeholder={placeholder}
 value={value}
 onChange={e => onChange(e.target.value)}
 className={cn(
 "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] h-12 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all",
 icon ? "pl-11 pr-4" : "px-4"
 )}
 />
 </div>
 </div>
 );
}