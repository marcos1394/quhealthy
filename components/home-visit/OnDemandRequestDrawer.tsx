"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  X,
  Phone,
  MessageCircle,
  AlertCircle,
  Navigation,
  KeyRound,
  Stethoscope,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { toast } from "sonner";

import { homeVisitService, HomeVisitDispatchResponse } from "@/services/homeVisit.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { getMapMarkerIcon } from "@/lib/mapPins";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];
const mapContainerStyle = { width: "100%", height: "240px", borderRadius: "1rem" };

const SPECIALTY_OPTIONS = [
  { id: "GENERAL_PRACTICE", label: "Medicina General", icon: Stethoscope, price: 600 },
  { id: "NURSING", label: "Enfermería / Inyecciones", icon: HeartPulse, price: 450 },
  { id: "PEDIATRICS", label: "Pediatría a Domicilio", icon: Sparkles, price: 800 },
  { id: "PHYSIOTHERAPY", label: "Fisioterapia y Rehabilitación", icon: Car, price: 750 },
];

interface OnDemandRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords?: { lat: number; lng: number };
}

export const OnDemandRequestDrawer: React.FC<OnDemandRequestDrawerProps> = ({
  isOpen,
  onClose,
  userCoords,
}) => {
  const t = useTranslations("HomeVisit.OnDemand");

  const [step, setStep] = useState<"FORM" | "SEARCHING" | "TRACKING">("FORM");
  const [selectedService, setSelectedService] = useState(SPECIALTY_OPTIONS[0]);
  const [patientAddress, setPatientAddress] = useState("");
  const [addressReferences, setAddressReferences] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    userCoords || { lat: 19.4326, lng: -99.1332 }
  );

  const [dispatchData, setDispatchData] = useState<HomeVisitDispatchResponse | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [searchTimer, setSearchTimer] = useState(45);
  const [submitting, setSubmitting] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState<number | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "on-demand-request-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "es",
  });

  // Polling para status general y ofertas/contra-ofertas en SEARCHING
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "SEARCHING" && dispatchData?.appointmentId) {
      interval = setInterval(async () => {
        try {
          // 1. Consultar estado general del despacho
          const status = await homeVisitService.getDispatchStatus(dispatchData.appointmentId);
          if (status.dispatchStatus === "ACCEPTED" || status.dispatchStatus === "EN_ROUTE") {
            setDispatchData(status);
            setStep("TRACKING");
            toast.success("¡Médico asignado! Va en camino a tu domicilio");
            return;
          }

          // 2. Consultar ofertas / contra-ofertas recibidas de médicos (InDrive style)
          const liveBids = await homeVisitService.getBids(dispatchData.appointmentId);
          setBids(liveBids);
        } catch (e) {
          // Silent polling error
        }
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [step, dispatchData?.appointmentId]);

  // Countdown para el radar de búsqueda
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "SEARCHING" && searchTimer > 0) {
      timer = setInterval(() => setSearchTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, searchTimer]);

  const handleSubmitRequest = async () => {
    if (!patientAddress.trim()) {
      toast.error("Por favor ingresa tu dirección completa");
      return;
    }

    try {
      setSubmitting(true);
      const res = await homeVisitService.requestHomeVisit({
        serviceName: selectedService.label,
        patientAddress,
        patientLatitude: coords.lat,
        patientLongitude: coords.lng,
        patientAddressReferences: addressReferences,
        symptoms,
        maxBudget: selectedService.price + 50,
      });

      setDispatchData(res);
      setBids([]);
      setStep(res.dispatchStatus === "ACCEPTED" ? "TRACKING" : "SEARCHING");
      setSearchTimer(45);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al solicitar médico a domicilio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    if (!dispatchData?.appointmentId) return;
    try {
      setAcceptingBidId(bidId);
      const updated = await homeVisitService.acceptBid(dispatchData.appointmentId, bidId);
      setDispatchData(updated);
      setStep("TRACKING");
      toast.success("¡Oferta aceptada! El especialista va en camino");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al aceptar la oferta");
    } finally {
      setAcceptingBidId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {step === "FORM" && "Solicitar Médico a Domicilio"}
                {step === "SEARCHING" && "Buscando Especialistas Cercanos..."}
                {step === "TRACKING" && "Médico en Camino a tu Domicilio"}
              </h3>
              <p className="text-[11px] text-gray-500">
                {step === "FORM" && "Atención presencial en tu hogar o trabajo"}
                {step === "SEARCHING" && `Contactando profesionales activos (${searchTimer}s)`}
                {step === "TRACKING" && "Seguimiento en tiempo real y código de seguridad"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Dinámico según Paso */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* PASO 1: FORMULARIO DE SOLICITUD */}
          {step === "FORM" && (
            <div className="space-y-5">
              {/* Selector de Especialidad / Servicio */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                  Selecciona el tipo de servicio requerido
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {SPECIALTY_OPTIONS.map((srv) => {
                    const isSelected = selectedService.id === srv.id;
                    const Icon = srv.icon;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-xs"
                            : "bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-mono font-bold text-xs text-emerald-600">
                            ${srv.price} MXN
                          </span>
                        </div>
                        <span className="text-xs font-bold line-clamp-1">{srv.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dirección y Mapa */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Ubicación exacta del paciente
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Calle, número exterior, colonia y ciudad"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-medium"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Referencias de acceso (ej. Edificio 3, Depto 402, portón blanco)"
                  value={addressReferences}
                  onChange={(e) => setAddressReferences(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-medium"
                />

                {/* Mapa Preview */}
                {isLoaded && (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={coords}
                      zoom={15}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    >
                      <MarkerF
                        position={coords}
                        draggable
                        onDragEnd={(e) => e.latLng && setCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                        icon={getMapMarkerIcon({ isHomeVisit: true, isSelected: true }, typeof google !== "undefined" ? google.maps : undefined)}
                      />
                    </GoogleMap>
                  </div>
                )}
              </div>

              {/* Motivo o Síntomas */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Motivo de consulta o síntomas principales
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe brevemente el cuadro o necesidad del paciente..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                />
              </div>

              {/* Resumen de Tarifa */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Consulta base:</span>
                  <span className="font-mono">${selectedService.price}.00 MXN</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tarifa de traslado estimada:</span>
                  <span className="font-mono">$50.00 MXN</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span>Total estimado:</span>
                  <span className="font-mono text-emerald-600">${selectedService.price + 50}.00 MXN</span>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <QhSpinner className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <>
                    <Car className="w-5 h-5" />
                    <span>Solicitar Médico a Domicilio Ahora</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* PASO 2: RADAR DE BÚSQUEDA & SUBASTA EN VIVO (InDrive/Uber style) */}
          {step === "SEARCHING" && (
            <div className="py-4 space-y-6">
              {/* Header con Radar y Timer */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 animate-ping absolute" />
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center z-10">
                      <Stethoscope className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {bids.length > 0
                        ? `¡${bids.length} propuesta${bids.length > 1 ? "s" : ""} recibida${bids.length > 1 ? "s" : ""}!`
                        : "Buscando especialistas cerca de ti..."}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {bids.length > 0
                        ? "Elige la oferta o contra-propuesta que más te convenga"
                        : "Notificando a profesionales en tu zona"}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {searchTimer}s
                </div>
              </div>

              {/* Lista de Ofertas / Contra-ofertas de Médicos (Estilo InDrive) */}
              {bids.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Propuestas de Médicos Disponibles:
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">En tiempo real ⚡</span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {bids.map((bid: any) => (
                      <motion.div
                        key={bid.bidId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
                              {bid.providerName?.substring(0, 2)?.toUpperCase() || "DR"}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                                  {bid.providerName}
                                </h5>
                                {bid.quScore && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                                    ★ {bid.quScore}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                Llega en ~{bid.estimatedArrivalMinutes || 20} min
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 block">
                              ${bid.offeredPrice} MXN
                            </span>
                            {bid.isCounterOffer && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                                Contra-oferta 🏷️
                              </span>
                            )}
                          </div>
                        </div>

                        {bid.note && (
                          <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 text-[11px] text-emerald-900 dark:text-emerald-300">
                            <span className="font-bold">Incluye: </span>
                            {bid.note}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAcceptBid(bid.bidId)}
                          disabled={acceptingBidId !== null}
                          className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {acceptingBidId === bid.bidId
                              ? "Confirmando..."
                              : `Aceptar Oferta de ${bid.providerName?.split(" ")[0]} ($${bid.offeredPrice} MXN)`}
                          </span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Esperando respuestas y cotizaciones de los médicos disponibles en tu radio...
                  </p>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Cancelar solicitud
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: TRACKING EN VIVO & CÓDIGO DE SEGURIDAD */}
          {step === "TRACKING" && dispatchData && (
            <div className="space-y-6">
              {/* Banner de Estado */}
              <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-lg shadow-emerald-600/20">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">Especialista en Camino</h4>
                    <p className="text-[11px] text-emerald-100">Llegada estimada: 25 - 30 min</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-white/20 text-xs font-bold font-mono">
                  ETA 25m
                </div>
              </div>

              {/* PIN de Seguridad de Arribo */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Código de Seguridad al Arribo
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Muestra este PIN a tu médico al llegar a tu puerta
                    </p>
                  </div>
                </div>
                <div className="text-xl font-mono font-extrabold tracking-widest text-amber-900 dark:text-amber-200 bg-white dark:bg-black px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-xs">
                  {dispatchData.securityPin || "7842"}
                </div>
              </div>

              {/* Tarjeta del Médico Asignado */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-base overflow-hidden">
                    {dispatchData.providerPhotoUrl ? (
                      <img src={dispatchData.providerPhotoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "Dr"
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      {dispatchData.providerName || "Dr. Médico Asignado"}
                    </h5>
                    <p className="text-xs text-emerald-600 font-medium">Médico General Verificado</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info("Conectando con el médico...")}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Abriendo chat directo...")}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
