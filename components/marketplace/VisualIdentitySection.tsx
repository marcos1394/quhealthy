"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  UploadCloud,
  Check,
  X,
  AlertCircle,
  Info,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/lib/handleApiError';


// Color presets - SATISFICING
const colorPresets = [
  { name: 'Purple', value: '#9333ea', category: 'popular' },
  { name: 'Blue', value: '#3b82f6', category: 'popular' },
  { name: 'Emerald', value: '#10b981', category: 'popular' },
  { name: 'Pink', value: '#ec4899', category: 'popular' },
  { name: 'Orange', value: '#f97316', category: 'warm' },
  { name: 'Teal', value: '#14b8a6', category: 'cool' },
  { name: 'Indigo', value: '#6366f1', category: 'cool' },
  { name: 'Rose', value: '#f43f5e', category: 'warm' }
];

export interface IdentitySettings {
  storeName: string;
  storeSlug: string;
  primaryColor: string;
  storeLogoUrl?: string;
  bannerImageUrl?: string;
}

interface VisualIdentitySectionProps {
  settings: IdentitySettings;
  onChange: (key: keyof IdentitySettings, value: string) => void;
  onImageUpload?: (type: 'logo' | 'banner', file: File) => Promise<void>; 
  onImageDelete?: (type: 'logo' | 'banner') => void;
}

export function VisualIdentitySection({ 
  settings, 
  onChange,
  onImageUpload,
  onImageDelete 
}: VisualIdentitySectionProps) {
  const [slugError, setSlugError] = useState<string>('');
  const [uploadingType, setUploadingType] = useState<'logo' | 'banner' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Validate slug
  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError('La URL es requerida');
      return false;
    }
    if (slug.length < 3) {
      setSlugError('Mínimo 3 caracteres');
      return false;
    }
    if (slug.length > 50) {
      setSlugError('Máximo 50 caracteres');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Solo letras, números y guiones');
      return false;
    }
    setSlugError('');
    return true;
  };

  // Handle slug change
  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
    onChange('storeSlug', sanitized);
    validateSlug(sanitized);
  };

  const handleImageUpload = async (type: 'logo' | 'banner', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setUploadingType(type);

    if (onImageUpload) {
      try {
        await onImageUpload(type, file); 
      } catch (error) {
        console.error("Error en componente al subir imagen", error);
      }
    }

    setUploadingType(null);
    event.target.value = ''; 
  };

  // Get image specs
  const getImageSpecs = (type: 'logo' | 'banner') => {
    return type === 'logo' 
      ? { size: '400x400px', aspect: 'Cuadrado 1:1' }
      : { size: '1200x400px', aspect: 'Rectangular 3:1' };
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20"
            >
              <Palette className="w-5 h-5 text-medical-600 dark:text-medical-400" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white mb-1">
                Identidad Visual
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Personaliza la apariencia de tu perfil público
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="border-medical-200 dark:border-medical-500/30 text-medical-600 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Ver'} Preview
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-2">
        
        {/* Live Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <p className="text-sm font-semibold text-medical-600 dark:text-medical-400">Vista Previa del Perfil</p>
              </div>
              
              {/* Banner Preview */}
              <div className="aspect-[3/1] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden mb-4 relative">
                {settings.bannerImageUrl ? (
                  <img src={settings.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
                
                {/* Logo Overlay */}
                <div className="absolute bottom-4 left-4">
                  {settings.storeLogoUrl ? (
                    <img 
                      src={settings.storeLogoUrl} 
                      alt="Logo" 
                      className="w-20 h-20 rounded-xl border-4 border-white dark:border-slate-900 shadow-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info Preview */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {settings.storeName || 'Nombre de la Tienda'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  quhealthy.com/{settings.storeSlug || 'tu-url'}
                </p>
                <Button 
                  size="sm"
                  style={{ backgroundColor: settings.primaryColor }}
                  className="text-white"
                >
                  Agendar Cita
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name and URL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Store Name */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Nombre de la Tienda
            </Label>
            <Input 
              placeholder="Ej: QuHealthy Centro Médico / Dr. Marcos" 
              value={settings.storeName}
              onChange={(e) => onChange('storeName', e.target.value)}
              className={cn(
                "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 h-12 text-base transition-all text-slate-900 dark:text-white",
                "focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20",
                !settings.storeName ? "border-red-500/50":""
              )}
            />
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Este nombre aparecerá en tu perfil público y búsquedas
            </p>
          </div>
          
          {/* Store Slug */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              URL Personalizada
            </Label>
            <div className="flex group">
              <span className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg px-4 py-3 text-sm text-slate-500 dark:text-slate-400 flex items-center group-focus-within:border-medical-500 transition-colors">
                quhealthy.com/
              </span>
              <Input 
                placeholder="mi-clinica" 
                value={settings.storeSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={cn(
                  "rounded-l-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 h-12 font-mono text-sm transition-all text-slate-900 dark:text-white",
                  "focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20",
                  slugError && "border-red-500/50"
                )}
              />
            </div>
            
            {/* Slug Validation Feedback */}
            {slugError ? (
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" />
                {slugError}
              </p>
            ) : settings.storeSlug && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                URL disponible
              </p>
            )}
          </div>
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Logo Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Logotipo
              </Label>
              <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-100 dark:border-medical-500/20 text-xs">
                {getImageSpecs('logo').size}
              </Badge>
            </div>
            
            {settings.storeLogoUrl ? (
              <div className="relative group">
                <img 
                  src={settings.storeLogoUrl} 
                  alt="Logo" 
                  className="w-full aspect-square object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="default"
                    variant="ghost"
                    onClick={() => logoInputRef.current?.click()}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                  {onImageDelete && (
                    <Button
                      size="default"
                      variant="ghost"
                      onClick={() => {
                        onImageDelete('logo');
                        toast.success('Logo eliminado');
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-medical-300 dark:hover:border-medical-500/50 transition-all cursor-pointer group bg-white dark:bg-slate-900/50"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/20 group-hover:scale-110 transition-all">
                  {uploadingType === 'logo' ? (
                    <RefreshCw className="w-8 h-8 text-medical-600 dark:text-medical-400 animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400" />
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Logo Cuadrado
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG o PNG • Máx 5MB
                </p>
              </div>
            )}
            
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload('logo', e)}
            />
          </div>

          {/* Banner Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Banner de Portada
              </Label>
              <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-100 dark:border-medical-500/20 text-xs">
                {getImageSpecs('banner').size}
              </Badge>
            </div>
            
            {settings.bannerImageUrl ? (
              <div className="relative group">
                <img 
                  src={settings.bannerImageUrl} 
                  alt="Banner" 
                  className="w-full aspect-[3/1] object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="default"
                    variant="ghost"
                    onClick={() => bannerInputRef.current?.click()}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                  {onImageDelete && (
                    <Button
                      size="default"
                      variant="ghost"
                      onClick={() => {
                        onImageDelete('banner');
                        toast.success('Banner eliminado');
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-medical-300 dark:hover:border-medical-500/50 transition-all cursor-pointer group bg-white dark:bg-slate-900/50"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/20 group-hover:scale-110 transition-all">
                  {uploadingType === 'banner' ? (
                    <RefreshCw className="w-8 h-8 text-medical-600 dark:text-medical-400 animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400" />
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Banner Horizontal
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG o PNG • Máx 5MB
                </p>
              </div>
            )}
            
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload('banner', e)}
            />
          </div>
        </div>

        {/* Color Picker Section */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Color de Marca
          </Label>

          {/* Color Presets */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Colores Populares
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {colorPresets.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onChange('primaryColor', preset.value)}
                  className={cn(
                    "w-full aspect-square rounded-lg border-2 transition-all relative",
                    settings.primaryColor === preset.value
                      ? "border-slate-900 dark:border-white shadow-lg scale-110"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {settings.primaryColor === preset.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Color Display */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-xl border-2 border-slate-200 dark:border-white/10 shadow-xl cursor-pointer relative overflow-hidden transition-transform hover:scale-105"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <input 
                    type="color" 
                    value={settings.primaryColor}
                    onChange={(e) => onChange('primaryColor', e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Color Personalizado
                </span>
                <Input 
                  value={settings.primaryColor} 
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val && !val.startsWith('#')) val = '#' + val;
                    onChange('primaryColor', val);
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-32 h-9 text-xs uppercase font-mono focus:border-medical-500 text-slate-900 dark:text-white"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="hidden sm:block w-px h-16 bg-slate-200 dark:bg-slate-800" />

            {/* Live Preview Button */}
            <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <div className="space-y-1">
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Vista Previa
              </button>
            </div>
          </div>
        </div>

        {/* Best Practices Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                💡 Mejores Prácticas de Identidad Visual
              </p>
              <ul className="space-y-1.5 text-xs text-emerald-600 dark:text-emerald-300/80">
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Usa imágenes de alta calidad y profesionales</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>El logo debe ser legible en tamaños pequeños</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Elige colores que transmitan profesionalismo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Mantén consistencia en todos tus materiales</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

      </CardContent>
    </Card>
  );
}