"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, StreetViewPanorama } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, CheckCircle2, ZoomIn, ZoomOut, Eye, Map as MapIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { googleService } from "@/services/google.service";
import { LocationData, LocationPickerProps } from "@/types/location";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = { width: "100%", height: "100%", borderRadius: "0.75rem", minHeight: "400px" };

// Light-friendly map style — neutral, clean aesthetic
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d5e0" }] },
  ],
};

const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showStreetView, setShowStreetView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setSelectedLocation(initialLocation);
      setInputValue(initialLocation.address || "");
      if (map) { map.panTo({ lat: initialLocation.lat, lng: initialLocation.lng }); map.setZoom(18); }
    }
  }, [initialLocation, map]);

  const updateLocationDetails = async (lat: number, lng: number, placeId?: string) => {
    setIsProcessing(true);
    try {
      const response = await googleService.reverseGeocode(lat, lng);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      const newLocation: LocationData = {
        lat, lng, address: data.formatted_address || "Selected location",
        placeId: placeId || data.place_id, city: selectedLocation?.city, state: selectedLocation?.state
      };
      setSelectedLocation(newLocation); setInputValue(newLocation.address); onLocationSelect(newLocation);
    } catch (err) { console.error(err); toast.error("Error updating location"); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="space-y-3 relative w-full h-full flex flex-col">
      {/* Info Bar */}
      <div className="relative z-20 bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm transition-colors">
        <div className="p-1.5 bg-medical-50 dark:bg-medical-500/10 rounded-lg">
          <MapPin className="w-4 h-4 text-medical-600 dark:text-medical-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium tracking-wider">Selected Location</p>
          <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{inputValue || "Loading address..."}</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-900 group transition-colors">
        {/* Street View Toggle */}
        <div className="absolute top-3 left-3 z-10">
          <Button size="sm" onClick={() => setShowStreetView(!showStreetView)}
            className={cn("shadow-sm backdrop-blur-md border transition-all h-7 text-xs font-medium rounded-lg",
              showStreetView ? "bg-slate-900 dark:bg-white border-slate-800 dark:border-slate-200 text-white dark:text-slate-900" : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800")}>
            {showStreetView ? <MapIcon className="w-3 h-3 mr-1.5" /> : <Eye className="w-3 h-3 mr-1.5" />}
            {showStreetView ? "MAP" : "STREET"}
          </Button>
        </div>

        {/* Google Map */}
        {!showStreetView && (
          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={17}
            center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: 19.4326, lng: -99.1332 }}
            options={mapOptions} onLoad={setMap}>
            {selectedLocation && (
              <MarkerF position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} draggable={true}
                onDragEnd={(e) => e.latLng && updateLocationDetails(e.latLng.lat(), e.latLng.lng())}
                animation={google.maps.Animation.DROP} />
            )}
          </GoogleMap>
        )}

        {/* Street View */}
        {showStreetView && selectedLocation && (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
            <StreetViewPanorama options={{ position: { lat: selectedLocation.lat, lng: selectedLocation.lng }, visible: true, disableDefaultUI: true, enableCloseButton: false, zoom: 1 }} />
          </GoogleMap>
        )}

        {/* Zoom Controls */}
        {!showStreetView && (
          <div className="absolute bottom-5 right-5 flex flex-col gap-px z-10">
            <button aria-label="Zoom in" onClick={() => map?.setZoom((map.getZoom() || 15) + 1)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-t-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button aria-label="Zoom out" onClick={() => map?.setZoom((map.getZoom() || 15) - 1)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900/90 border-x border-b border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-b-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <Loader2 className="w-7 h-7 animate-spin text-medical-600 dark:text-medical-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation */}
      {selectedLocation && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-lg p-2.5 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-medical-600 dark:text-medical-400" />
            <p className="text-xs text-medical-600 dark:text-medical-400 font-medium">Location Ready</p>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</p>
        </motion.div>
      )}
    </div>
  );
};

const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({ id: "google-map-script", googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", libraries });
  if (loadError) return <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl transition-colors">Error loading map</div>;
  if (!isLoaded) return null;
  return <MapWithAutocomplete {...props} />;
};

export default EnhancedLocationPicker;