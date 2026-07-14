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
 className="absolute inset-0 bg-black/80 backdrop-blur-sm"
 onClick={onClose}
 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 />

 {/* Panel Blueprint */}
 <motion.div
 className="relative z-10 w-full sm:max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-none border flex flex-col shadow-2xl max-h-[90vh]"
 style={{ borderColor: themeColor }}
 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
 >
 {/* Header Editorial */}
 <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex-shrink-0">
 <div>
 <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
 {hasPhysical ? "Finalización de Pedido" : (isBooking ? "Confirmación de Reserva" : "Finalización de Contrato")}
 </h2>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
 {[hasPhysical && "Logística", needsPrescription && "Validación Clínica"]
 .filter(Boolean).join(" · ")}
 </p>
 </div>
 <button onClick={onClose} className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors bg-white dark:bg-black">
 <X className="w-4 h-4" strokeWidth={1.5} />
 </button>
 </div>

 {/* Scrollable content */}
 <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-12 custom-scrollbar">

 {/* ── SECCIÓN 0: ORDER SUMMARY (SIEMPRE VISIBLE) ──────────────── */}
 <section className="py-2">
 <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
 <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: themeColor, backgroundColor: themeColor, color: '#ffffff' }}>
 <Package className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <div>
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Resumen de Ítems</h3>
 <p className="text-[9px] uppercase tracking-widest text-gray-500">Verifique el contenido de su orden antes de liquidar.</p>
 </div>
 </div>

 <div className="space-y-4 mb-10">
 {cart.map((item, idx) => (
 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 group gap-4">
 <div className="flex items-center gap-4 min-w-0 flex-1">
 <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex-shrink-0 flex items-center justify-center overflow-hidden relative">
 {item.imageUrl && (
 // eslint-disable-next-line @next/next/no-img-element
 <img 
 src={item.imageUrl} 
 alt={item.name} 
 className="absolute inset-0 w-full h-full object-cover transition-all z-10 bg-white dark:bg-black" 
 onError={(e) => {
 e.currentTarget.style.opacity = '0';
 }}
 />
 )}
 <div className="absolute inset-0 flex items-center justify-center z-0">
 {item.type === 'PACKAGE' ? <Package className="w-4 h-4 text-gray-400" strokeWidth={1.5} /> : (item.type === 'SERVICE' ? <CalendarIcon className="w-4 h-4 text-gray-400" strokeWidth={1.5} /> : <MonitorPlay className="w-4 h-4 text-gray-400" strokeWidth={1.5} />)}
 </div>
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-bold uppercase tracking-widest text-black dark:text-white line-clamp-1">
 {item.name}
 </span>
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1" style={{ color: themeColor }}>
 {item.type === 'PACKAGE' ? 'PAQUETE' : (item.type === 'SERVICE' ? 'SERVICIO' : (item.isDigital ? 'DIGITAL' : 'FÍSICO'))}
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
 {/* Control Cuantitativo */}
 {item.type === 'PRODUCT' ? (
 <div className="flex items-center h-8 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]">
 <button 
 onClick={() => {
 if (item.cartQuantity && item.cartQuantity > 1) {
 updateQuantity(item.id, item.cartQuantity - 1);
 } else {
 removeFromCart(item.id);
 }
 }}
 className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
 >
 -
 </button>
 <span className="w-8 text-center text-[10px] font-bold text-black dark:text-white">
 {item.cartQuantity || 1}
 </span>
 <button 
 onClick={() => updateQuantity(item.id, (item.cartQuantity || 1) + 1)}
 className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
 >
 +
 </button>
 </div>
 ) : (
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 1x
 </span>
 )}

 {/* Subtotal del Item */}
 <span className="text-sm font-semibold tracking-tight text-black dark:text-white min-w-[80px] text-right">
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
 <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
 <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: themeColor, backgroundColor: themeColor, color: '#ffffff' }}>
 <Truck className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <div>
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Parámetros de Logística</h3>
 <p className="text-[9px] uppercase tracking-widest text-gray-500">Defina el vector de entrega para ítems físicos.</p>
 </div>
 </div>

 {/* 🚀 Selector Arquitectónico (Acento con themeColor) */}
 <div className="grid grid-cols-2 gap-0 border border-gray-300 dark:border-gray-700 mb-8">
 <button 
 className={cn(
 "p-5 flex items-center justify-center gap-3 transition-colors text-[10px] font-bold uppercase tracking-widest"
 )}
 style={shippingMethod === 'DELIVERY' ? { backgroundColor: themeColor, color: '#ffffff' } : {}}
 onClick={() => setShippingMethod('DELIVERY')}
 >
 <Truck className="w-4 h-4" strokeWidth={shippingMethod === 'DELIVERY' ? 2 : 1.5} /> Domicilio
 </button>
 <button 
 className={cn(
 "p-5 flex items-center justify-center gap-3 transition-colors text-[10px] font-bold uppercase tracking-widest border-l border-gray-300 dark:border-gray-700"
 )}
 style={shippingMethod === 'PICKUP' ? { backgroundColor: themeColor, color: '#ffffff' } : {}}
 onClick={() => setShippingMethod('PICKUP')}
 >
 <Store className="w-4 h-4" strokeWidth={shippingMethod === 'PICKUP' ? 2 : 1.5} /> In-Situ
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
 className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-xl overflow-hidden max-h-60 overflow-y-auto rounded-none custom-scrollbar"
 >
 {suggestions.map((sug) => (
 <li 
 key={sug.place_id}
 onClick={() => handleSelectSuggestion(sug.place_id, sug.description)}
 className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer border-b border-gray-200 dark:border-gray-800 last:border-0 flex items-start gap-3 transition-colors"
 >
 <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
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
 <div className="p-5 bg-gray-50 dark:bg-[#050505] border border-gray-300 dark:border-gray-700 text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
 INDIQUE EL BLOQUE TEMPORAL PARA SU RECOLECCIÓN EN INSTALACIONES.
 </div>
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2.5">Fecha Programada</label>
 <DatePicker
 value={pickupDate}
 onChange={setPickupDate}
 disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6}
 placeholder="DD/MM/AAAA"
 className="rounded-none border-gray-300 dark:border-gray-700 bg-white dark:bg-black h-12"
 popoverClassName="z-[100] rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a]"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2.5">Horario</label>
 <Select value={pickupTimeStr} onValueChange={setPickupTimeStr}>
 <SelectTrigger className="w-full rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-black h-12 text-[10px] font-bold uppercase tracking-widest focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
 <SelectValue placeholder="HH:MM" />
 </SelectTrigger>
 <SelectContent className="max-h-64 z-[100] rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] custom-scrollbar">
 {PICKUP_TIMES.map((time) => (
 <SelectItem key={time} value={time} className="text-[10px] font-bold uppercase tracking-widest focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
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
 className="mt-8 p-5 bg-gray-50 dark:bg-[#050505] border border-black dark:border-white flex items-center gap-3"
 >
 <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0" strokeWidth={1.5} />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white leading-relaxed">
 {buildAddressString(address)}
 </p>
 </motion.div>
 )}
 </section>
 )}

 {/* ── SECCIÓN 2: RECETAS MÉDICAS ─────────────────────────────── */}
 {needsPrescription && (
 <section className="pt-4">
 <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
 <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: themeColor, backgroundColor: themeColor, color: '#ffffff' }}>
 <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <div>
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Auditoría de Prescripción</h3>
 <p className="text-[9px] uppercase tracking-widest text-gray-500">Documentación Clínica Obligatoria.</p>
 </div>
 </div>

 <div className="space-y-4">
 {itemsNeedingRx.map(item => {
 const uploaded = !!prescriptionUrls[item.id];
 const isUploading = uploadingId === item.id;
 const error = uploadErrors[item.id];

 return (
 <div key={item.id} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] p-6 space-y-5 hover:border-black dark:hover:border-white transition-colors">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
 <div>
 <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mb-1.5">{item.name}</p>
 {item.activeIngredient && (
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">ACTIVO: {item.activeIngredient}</p>
 )}
 </div>
 {uploaded && (
 <span className="border px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit" style={{ borderColor: themeColor, backgroundColor: themeColor, color: '#ffffff' }}>
 <CheckCircle2 className="w-3 h-3" strokeWidth={2} /> VERIFICADA
 </span>
 )}
 </div>

 {/* 🚀 Drop zone Arquitectónico (themeColor accent en icono) */}
 <button
 type="button"
 onClick={() => fileInputRefs.current[item.id]?.click()}
 disabled={isUploading}
 className={cn(
 "w-full border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-colors",
 uploaded
 ? "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white"
 : "border-gray-400 dark:border-gray-600 bg-white dark:bg-black hover:border-black dark:hover:border-white",
 "cursor-pointer"
 )}
 >
 {isUploading ? (
 <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} style={{ color: themeColor }} />
 ) : uploaded ? (
 <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} style={{ color: themeColor }} />
 ) : (
 <Upload className="w-6 h-6" strokeWidth={1.5} style={{ color: themeColor }} />
 )}
 
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white text-center">
 {isUploading
 ? "EJECUTANDO CIFRADO Y CARGA..."
 : uploaded
 ? "REEMPLAZAR ARCHIVO ADJUNTO"
 : "HAGA CLIC PARA ADJUNTAR DOCUMENTO CLÍNICO"}
 </span>
 <span className="text-[9px] uppercase tracking-widest text-gray-400">PDF, JPG, PNG · LÍMITE: 5 MB</span>
 </button>

 <input
 ref={el => { fileInputRefs.current[item.id] = el; }}
 type="file"
 accept="image/*,application/pdf"
 className="hidden"
 onChange={e => handleFileChange(item.id, e.target.files?.[0] ?? null)}
 />

 {error && (
 <div className="p-3.5 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
 <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} /> {error}
 </div>
 )}
 </div>
 );
 })}
 </div>

 <div className="mt-8 p-5 border flex items-start gap-3" style={{ borderColor: themeColor, backgroundColor: themeColor, color: '#ffffff' }}>
 <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
 <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
 LA RECETA SERÁ CIFRADA DE EXTREMO A EXTREMO. USO EXCLUSIVO PARA AUDITORÍA DE DISPENSACIÓN POR PARTE DEL ESPECIALISTA.
 </p>
 </div>
 </section>
 )}

 {/* ── SECCIÓN DE PAGO ─────────────────────────────── */}
 <section className="pt-4">
 <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
 <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: themeColor, backgroundColor: themeColor, color: '#ffffff' }}>
 <CreditCard className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <div>
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Método de Pago</h3>
 <p className="text-[9px] uppercase tracking-widest text-gray-500">Seleccione la fuente de fondos.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Stripe */}
 <button
 onClick={() => setPaymentMethod('CREDIT_CARD')}
 className={cn(
 "p-5 border flex flex-col items-start gap-2 transition-colors relative text-left",
 paymentMethod === 'CREDIT_CARD' 
 ? "bg-white dark:bg-[#0a0a0a]" 
 : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white"
 )}
 style={paymentMethod === 'CREDIT_CARD' ? { borderColor: themeColor } : {}}
 >
 {paymentMethod === 'CREDIT_CARD' && (
 <CheckCircle2 className="w-4 h-4 absolute top-4 right-4" strokeWidth={2} style={{ color: themeColor }} />
 )}
 <CreditCard className="w-5 h-5 mb-1" strokeWidth={1.5} style={paymentMethod === 'CREDIT_CARD' ? { color: themeColor } : { color: '#6b7280' }} />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Tarjeta / Stripe</span>
 <span className="text-[9px] uppercase tracking-widest text-gray-500">Pago externo seguro</span>
 </button>

 {/* QuWallet */}
 <button
 onClick={() => {
 if (walletBalance >= totalAmount) {
 setPaymentMethod('WALLET_BALANCE');
 }
 }}
 disabled={walletBalance < totalAmount}
 className={cn(
 "p-5 border flex flex-col items-start gap-2 transition-colors relative text-left",
 paymentMethod === 'WALLET_BALANCE' 
 ? "bg-white dark:bg-[#0a0a0a]" 
 : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-gray-700"
 )}
 style={paymentMethod === 'WALLET_BALANCE' ? { borderColor: themeColor } : {}}
 >
 {paymentMethod === 'WALLET_BALANCE' && (
 <CheckCircle2 className="w-4 h-4 absolute top-4 right-4" strokeWidth={2} style={{ color: themeColor }} />
 )}
 <Wallet className="w-5 h-5 mb-1" strokeWidth={1.5} style={paymentMethod === 'WALLET_BALANCE' ? { color: themeColor } : { color: '#6b7280' }} />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 QuWallet
 {isLoadingWallet && <Loader2 className="w-3 h-3 animate-spin" />}
 </span>
 <span className="text-[9px] uppercase tracking-widest text-gray-500">
 Saldo: ${walletBalance.toLocaleString()} MXN
 </span>
 {walletBalance < totalAmount && (
 <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 mt-1">Saldo Insuficiente</span>
 )}
 </button>
 </div>
 </section>
 </div>

 {/* Footer CTA */}
 <div className="flex-shrink-0 p-6 md:p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Liquidación Total
 </span>
 <span className="text-2xl font-semibold tracking-tight text-black dark:text-white">
 ${totalAmount.toLocaleString()} <span className="text-sm font-light text-gray-500">MXN</span>
 </span>
 </div>
 <Button
 onClick={handleConfirm}
 disabled={!canSubmit}
 className="w-full rounded-none text-[10px] font-bold uppercase tracking-widest border-0 transition-colors disabled:opacity-50 h-14"
 style={(!canSubmit) ? {} : { backgroundColor: themeColor, color: '#ffffff' }}
 >
 {isProcessing ? (
 <><Loader2 className="w-4 h-4 mr-3 animate-spin" strokeWidth={2} /> PROCESANDO TRANSACCIÓN...</>
 ) : (
 "EJECUTAR PAGO SEGURO →"
 )}
 </Button>

 {/* Validation hints */}
 {!addressOk && (
 <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 text-center mt-4 flex items-center justify-center gap-2">
 <AlertCircle className="w-3 h-3" strokeWidth={2}/> ERROR: COORDENADAS LOGÍSTICAS INCOMPLETAS.
 </p>
 )}
 {!rxOk && (
 <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 text-center mt-4 flex items-center justify-center gap-2">
 <AlertCircle className="w-3 h-3" strokeWidth={2}/> ERROR: DOCUMENTACIÓN CLÍNICA PENDIENTE.
 </p>
 )}
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
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">{label}</label>
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
 "w-full rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-black h-12 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest",
 icon ? "pl-12 pr-4" : "px-4"
 )}
 />
 </div>
 </div>
 );
}