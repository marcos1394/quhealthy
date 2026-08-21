"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  X, 
  Navigation,
  Globe,
  Map as MapIcon,
  HeartPulse
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoundationIdentityPayload, OrganizationType } from "@/types/foundation";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { googleService } from "@/services/google.service";
import LocationPicker from "@/components/shared/location/LocationPicker";
import { LocationData } from "@/types/location";

interface Step1IdentityProps {
  initialData?: Partial<FoundationIdentityPayload>;
  onSave: (data: FoundationIdentityPayload) => Promise<void>;
  isLoading?: boolean;
}

interface PlaceSuggestion {
  description: string;
  place_id?: string;
  placeId?: string;
}

const HEALTH_CAUSES = [
  { id: "RENAL_TRANSPLANT", label: "Salud Renal & Donación / Trasplante de Órganos", icon: "🫀" },
  { id: "VISUAL_HEALTH", label: "Salud Visual (Córneas, Cataratas, Estrabismo)", icon: "👁️" },
  { id: "ONCOLOGY", label: "Oncología Pediátrica y Adultos", icon: "🎗️" },
  { id: "CARDIOLOGY", label: "Cardiopatías y Salud Cardiovascular", icon: "❤️" },
  { id: "MATERNAL_CHILD", label: "Salud Materno-Infantil & Nutrición", icon: "👶" },
  { id: "MENTAL_HEALTH", label: "Salud Mental y Apoyo Psicosocial", icon: "🧠" },
  { id: "RARE_DISEASES", label: "Enfermedades Raras y Genéticas", icon: "🧬" },
  { id: "GENERAL_HEALTH", label: "Medicina General y Asistencia Comunitaria", icon: "🏥" },
];

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  initialData,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FoundationIdentityPayload>({
    legalName: initialData?.legalName || "",
    brandName: initialData?.brandName || "",
    organizationType: initialData?.organizationType || "IAP",
    mission: initialData?.mission || "",
    vision: initialData?.vision || "",
    description: initialData?.description || "",
    websiteUrl: initialData?.websiteUrl || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    addressStreet: initialData?.addressStreet || "",
    addressNumber: initialData?.addressNumber || "",
    addressNeighborhood: initialData?.addressNeighborhood || "",
    addressCity: initialData?.addressCity || "",
    addressState: initialData?.addressState || "",
    addressPostalCode: initialData?.addressPostalCode || "",
    primaryCauses: initialData?.primaryCauses || ["RENAL_TRANSPLANT"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlaceFormatted, setSelectedPlaceFormatted] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const response = await googleService.autocomplete(searchQuery.trim());
        if (Array.isArray(response)) {
          setSuggestions(response);
        } else if (response && Array.isArray(response.predictions)) {
          setSuggestions(response.predictions);
        } else {
          setSuggestions([]);
        }
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error al autocompletar con Google Places:", error);
        setSuggestions([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseAddressComponents = (components: any[]) => {
    let streetNumber = "";
    let route = "";
    let neighborhood = "";
    let city = "";
    let state = "";
    let postalCode = "";

    if (!Array.isArray(components)) return { streetNumber, route, neighborhood, city, state, postalCode };

    for (const c of components) {
      const types: string[] = c.types || [];
      if (types.includes("street_number")) {
        streetNumber = c.long_name || "";
      } else if (types.includes("route")) {
        route = c.long_name || "";
      } else if (
        types.includes("sublocality_level_1") || 
        types.includes("sublocality") || 
        types.includes("neighborhood")
      ) {
        if (!neighborhood) neighborhood = c.long_name || "";
      } else if (types.includes("locality")) {
        city = c.long_name || "";
      } else if (types.includes("administrative_area_level_2") && !city) {
        city = c.long_name || "";
      } else if (types.includes("administrative_area_level_1")) {
        state = c.long_name || "";
      } else if (types.includes("postal_code")) {
        postalCode = c.long_name || "";
      }
    }

    return { streetNumber, route, neighborhood, city, state, postalCode };
  };

  const handleSelectPlace = async (placeId?: string, description?: string) => {
    if (!placeId) return;
    setIsSearchingPlaces(true);
    setShowSuggestions(false);
    try {
      const response = await googleService.getDetails(placeId);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      const result = data.result || data;
      const components = result.address_components || [];
      const parsed = parseAddressComponents(components);

      setFormData((prev) => ({
        ...prev,
        addressStreet: parsed.route || prev.addressStreet,
        addressNumber: parsed.streetNumber || prev.addressNumber,
        addressNeighborhood: parsed.neighborhood || prev.addressNeighborhood,
        addressCity: parsed.city || prev.addressCity,
        addressState: parsed.state || prev.addressState,
        addressPostalCode: parsed.postalCode || prev.addressPostalCode,
      }));

      setSelectedPlaceFormatted(result.formatted_address || description || null);
      setSearchQuery(result.formatted_address || description || "");
    } catch (error) {
      console.error("Error al obtener detalles del lugar de Google:", error);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleLocationFromMap = (location: LocationData) => {
    setSelectedPlaceFormatted(location.address);
    setSearchQuery(location.address);
    if (location.placeId) {
      handleSelectPlace(location.placeId, location.address);
    }
  };

  const toggleCause = (causeId: string) => {
    setFormData((prev) => {
      const current = prev.primaryCauses || [];
      if (current.includes(causeId)) {
        return { ...prev, primaryCauses: current.filter((c) => c !== causeId) };
      } else {
        return { ...prev, primaryCauses: [...current, causeId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.legalName.trim()) return;
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto font-sans">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              1. Identidad Institucional & Razón Social
            </h2>
            <p className="text-xs text-gray-500">Datos públicos y figura jurídica de la organización.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Razón Social Oficial <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="Ej. Asociación ALE, I.A.P. o Fundación Pro Salud A.C."
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Nombre Comercial o Público
            </label>
            <Input
              placeholder="Ej. Fundación ALE"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Tipo de Organización <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.organizationType}
              onValueChange={(val: OrganizationType) => setFormData({ ...formData, organizationType: val })}
            >
              <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="IAP">I.A.P. (Institución de Asistencia Privada)</SelectItem>
                <SelectItem value="AC">A.C. (Asociación Civil)</SelectItem>
                <SelectItem value="IBP">I.B.P. (Institución de Beneficencia Privada)</SelectItem>
                <SelectItem value="ABP">A.B.P. (Asociación de Beneficencia Privada)</SelectItem>
                <SelectItem value="FOUNDATION">Fundación / Patronato Independiente</SelectItem>
                <SelectItem value="OTHER">Otra Figura Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Misión Institucional
            </label>
            <Textarea
              rows={3}
              placeholder="Describe el propósito y la causa principal de la fundación..."
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Visión Institucional
            </label>
            <Textarea
              rows={2}
              placeholder="¿Hacia dónde se proyecta el impacto de la institución?"
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              2. Áreas de Enfoque y Causas Médicas
            </h2>
            <p className="text-xs text-gray-500">Selecciona los programas de salud donde canalizan su asistencia social.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HEALTH_CAUSES.map((cause) => {
            const isSelected = (formData.primaryCauses || []).includes(cause.id);
            return (
              <div
                key={cause.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleCause(cause.id)}
                onKeyDown={(e) => e.key === "Enter" && toggleCause(cause.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a]"
                }`}
              >
                <span className="text-xl">{cause.icon}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white flex-1">{cause.label}</span>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                  isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300"
                }`}>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                3. Sede Operativa & Contacto
              </h2>
              <p className="text-xs text-gray-500">Búsqueda inteligente con Google Places y desglose automático de dirección.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            <MapIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{showMap ? "Ocultar Mapa" : "Ver en Mapa Interactivo"}</span>
          </button>
        </div>

        <div ref={searchContainerRef} className="relative space-y-2">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Buscar Dirección en Google Places (Autocompletado Rápido)</span>
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>

            <Input
              type="text"
              placeholder="Escribe la calle, colonia, ciudad o nombre de la sede..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className="pl-10 pr-10 bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 h-12 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500"
            />

            <div className="absolute right-3.5 flex items-center gap-2">
              {isSearchingPlaces && (
                <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              )}
              {searchQuery && !isSearchingPlaces && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setSelectedPlaceFormatted(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {suggestions.map((item, idx) => {
                const pId = item.place_id || item.placeId;
                return (
                  <button
                    key={pId || idx}
                    type="button"
                    onClick={() => handleSelectPlace(pId, item.description)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 flex items-start gap-3 transition-colors text-xs cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 shrink-0 mt-0.5 transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {item.description}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">Google Places API</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedPlaceFormatted && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Dirección desglosada y verificada con Google Places</span>
            </div>
          )}
        </div>

        {showMap && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <LocationPicker
              onLocationSelect={handleLocationFromMap}
              className="h-80 w-full"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Calle / Avenida</label>
            <Input
              placeholder="Ej. Paseo Niños Héroes / Insurgentes"
              value={formData.addressStreet}
              onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Número Ext / Int</label>
            <Input
              placeholder="Ej. 1205 Ext. / Int. 3B"
              value={formData.addressNumber}
              onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Colonia / Sector</label>
            <Input
              placeholder="Ej. Las Quintas / Providencia"
              value={formData.addressNeighborhood}
              onChange={(e) => setFormData({ ...formData, addressNeighborhood: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Ciudad / Municipio</label>
            <Input
              placeholder="Ej. Culiacán / Guadalajara / Monterrey"
              value={formData.addressCity}
              onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Estado</label>
            <Input
              placeholder="Ej. Sinaloa / Jalisco / Nuevo León"
              value={formData.addressState}
              onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Código Postal</label>
            <Input
              placeholder="80000"
              value={formData.addressPostalCode}
              onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Correo Electrónico Institucional</label>
            <Input
              type="email"
              placeholder="contacto@fundacion.org"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Teléfono de Atención</label>
            <Input
              placeholder="Ej. 667 123 4567"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Sitio Web Oficial</label>
            <Input
              placeholder="https://fundacion.org"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || !formData.legalName.trim()}
          className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
        >
          {isLoading ? (
            <QhSpinner size="sm" className="text-white" />
          ) : (
            <>
              <span>Continuar a Validación Legal & Fiscal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
