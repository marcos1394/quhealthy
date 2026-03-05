"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  Tag, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  DollarSign,
  Percent,
  X,
  Zap,
  ShoppingCart,
  Camera
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

// Importamos el tipo Service
import { Service } from "./ServicesManager";

// Types
export interface ServicePackage {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  serviceIds: number[];
  imageUrl?: string;
  isNew?: boolean;
  color?: string;
}

interface PackagesManagerProps {
  packages: ServicePackage[];
  availableServices: Service[];
  onSave: (pkg: ServicePackage) => void;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void;
}

export function PackagesManager({
  packages, 
  availableServices, 
  onSave, 
  onDelete,
  onImageUpload
}: PackagesManagerProps) {
  const t = useTranslations('Marketplace.packages');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [realValue, setRealValue] = useState(0);
  const [savings, setSavings] = useState(0);

  // Calcular valor real - FEEDBACK INMEDIATO
  useEffect(() => {
    if (editingPackage) {
      const calculated = calculateRealValue(editingPackage.serviceIds);
      setRealValue(calculated);
      
      const currentSavings = calculated - editingPackage.price;
      setSavings(Math.max(0, currentSavings));
    }
  }, [editingPackage]);

  // Helpers
  const calculateRealValue = (serviceIds: number[]) => {
    return serviceIds.reduce((total, id) => {
      const service = availableServices.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
  };

  const calculateSavingsPercent = (realVal: number, packagePrice: number) => {
    if (realVal === 0) return 0;
    const saving = realVal - packagePrice;
    return Math.round((saving / realVal) * 100);
  };

  // Sugerencias de precio inteligentes - SATISFICING
  const getSuggestedPrices = (realVal: number) => {
    return [
      { label: '10% OFF', percent: 10, price: Math.round(realVal * 0.9), color: 'blue' },
      { label: '15% OFF', percent: 15, price: Math.round(realVal * 0.85), color: 'purple' },
      { label: '20% OFF', percent: 20, price: Math.round(realVal * 0.8), color: 'emerald' }
    ];
  };

  // Lógica de edición
  const handleOpenDialog = (pkg?: ServicePackage) => {
    if (pkg) {
      setEditingPackage({ ...pkg });
      const realVal = calculateRealValue(pkg.serviceIds);
      const currentPercent = calculateSavingsPercent(realVal, pkg.price);
      setDiscountPercent(currentPercent || 15);
    } else {
      setEditingPackage({
        id: -Date.now(),
        name: "",
        description: "",
        category: "",
        price: 0,
        serviceIds: [],
        isNew: true,
        color: 'purple'
      });
      setDiscountPercent(15);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPackage && editingPackage.name && editingPackage.category && editingPackage.price > 0 && editingPackage.serviceIds.length > 0) {
      onSave(editingPackage);
      toast.success(t('saved'));
      setIsDialogOpen(false);
      setEditingPackage(null);
    } else {
      toast.error(t('incomplete'));
    }
  };

  const toggleServiceInPackage = (serviceId: number) => {
    if (!editingPackage) return;
    
    const currentIds = editingPackage.serviceIds;
    let newIds;
    
    if (currentIds.includes(serviceId)) {
      newIds = currentIds.filter(id => id !== serviceId);
    } else {
      newIds = [...currentIds, serviceId];
    }
    
    setEditingPackage({ ...editingPackage, serviceIds: newIds });
  };

  // Aplicar sugerencia de precio - SATISFICING
  const applySuggestedPrice = (price: number, percent: number) => {
    if (!editingPackage) return;
    setEditingPackage({ ...editingPackage, price });
    setDiscountPercent(percent);
    toast.success(t('applied_discount', { percent }));
  };

  // Aplicar descuento por slider - FEEDBACK INMEDIATO
  const applyDiscountPercent = (percent: number) => {
    if (!editingPackage || realValue === 0) return;
    const newPrice = Math.round(realValue * (1 - percent / 100));
    setEditingPackage({ ...editingPackage, price: newPrice });
    setDiscountPercent(percent);
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden">
      
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 bg-white dark:bg-slate-900">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-4 text-slate-900 dark:text-white text-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-2xl border border-pink-200 dark:border-pink-500/30 text-pink-600 dark:text-pink-600 dark:text-pink-400"
            >
              <Package className="w-7 h-7 text-pink-600 dark:text-pink-400" />
            </motion.div>
            {t('title')}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 flex items-center gap-3 text-base">
            {t('description')}
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs shadow-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              {t('conversion_badge')}
            </Badge>
          </CardDescription>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl h-11 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> {t('create_package')}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-8 p-8">
        
        {/* Empty State */}
        {packages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/30"
          >
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <Tag className="w-12 h-12 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('empty_title')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{t('empty_desc')}</p>
            <Button 
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 h-11"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('create_first')}
            </Button>
          </motion.div>
        ) : (
          /* Packages Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {packages.map((pkg) => {
                const realVal = calculateRealValue(pkg.serviceIds);
                const savingsAmt = Math.max(0, realVal - pkg.price);
                const savingsPerc = calculateSavingsPercent(realVal, pkg.price);

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -6 }}
                    className="bg-gradient-to-br from-gray-950 to-gray-900 border-2 border-gray-800 rounded-3xl p-6 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-purple-50/50 dark:bg-purple-900/5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{pkg.name}</h3>
                            {savingsAmt > 0 && (
                              <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-md">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {t('off', { percent: savingsPerc })}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {pkg.description || "{t('custom_package')}"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                          <Button 
                            variant="ghost" 
                            size="default"
                            onClick={() => handleOpenDialog(pkg)} 
                            className="h-10 w-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="default"
                            onClick={() => {
                              onDelete(pkg.id);
                              toast.success(t('deleted'));
                            }}
                            className="h-10 w-10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Services Chips */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pkg.serviceIds.map(id => {
                          const s = availableServices.find(service => service.id === id);
                          return s ? (
                            <span 
                              key={id} 
                              className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-xl border border-gray-700 flex items-center gap-1.5 font-medium"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {s.name}
                            </span>
                          ) : null;
                        })}
                      </div>

                      <Separator className="bg-slate-100 dark:bg-slate-800 mb-6" />

                      {/* Pricing */}
                      <div className="flex items-end justify-between">
                        <div>
                          {savingsAmt > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-slate-500 dark:text-slate-400 line-through font-semibold">${realVal}</span>
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-bold">
                                {t('savings', { amount: savingsAmt })}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              ${pkg.price}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">MXN</span>
                          </div>
                        </div>

                        <Badge className="bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 shadow-md">
                          {t('services_count', { count: pkg.serviceIds.length })}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Footer */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-lg"
          >
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <div className="text-sm text-blue-300/80">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-base">
                {t('tip_title')}
              </p>
              <p className="leading-relaxed">
                {t('tip_desc')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Modal de Edición */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <DialogTitle className="text-3xl font-black text-white mb-2">
                    {editingPackage?.id && editingPackage.id > 0 ? "{t('dialog_edit')}" : "{t('dialog_create')}"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400 text-base">
                    {t('dialog_desc')}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-400 hover:text-white h-10 w-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            {editingPackage && (
              <div className="space-y-8 py-6">
                
                {/* Value Preview Card - FEEDBACK VISUAL */}
                {editingPackage.serviceIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-2 font-bold tracking-wider">{t('real_value')}</p>
                        <p className="text-3xl font-black text-white">${realValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-2 font-bold tracking-wider">{t('your_price')}</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          ${editingPackage.price}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-2 font-bold tracking-wider">{t('saving')}</p>
                        <p className="text-3xl font-black text-emerald-400">${savings}</p>
                        <p className="text-xs text-emerald-400 font-bold mt-1">
                          {calculateSavingsPercent(realValue, editingPackage.price)}% OFF
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column: Package Details */}
                  <div className="space-y-6">
                    
                    {/* Row 1: Image, Name & Category */}
                    <div className="flex gap-4 items-start">
                      {/* Image Upload */}
                      <div className="relative group/pkg-img flex-shrink-0">
                        <div className={cn(
                          "w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/50 shadow-lg",
                          editingPackage.imageUrl ? "border-pink-500/50 shadow-pink-500/20" : "border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500/50 hover:bg-gray-900 hover:shadow-xl"
                        )}>
                          {editingPackage.imageUrl ? (
                            <img src={editingPackage.imageUrl} alt="Paquete" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-2 group-hover/pkg-img:text-pink-600 dark:text-pink-400 transition-colors" />
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('photo')}</span>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onImageUpload && editingPackage) {
                              onImageUpload(editingPackage.id, file); 
                            }
                            e.target.value = '';
                          }}
                        />
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {/* Name */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                            {t('name_label')}
                          </Label>
                          <Input 
                            value={editingPackage.name}
                            onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                            placeholder={t('name_placeholder')}
                            className={cn(
                              "bg-slate-50 dark:bg-slate-800/50 border-gray-700 h-12 text-base font-semibold focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20",
                              !editingPackage.name ? "border-red-500/50" : ""
                            )}
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                            {t('category_label')}
                          </Label>
                          <Input 
                            value={editingPackage.category || ''}
                            onChange={(e) => setEditingPackage({ ...editingPackage, category: e.target.value })}
                            placeholder={t('category_placeholder')}
                            className={cn(
                              "bg-slate-50 dark:bg-slate-800/50 border-gray-700 h-12 text-base font-semibold focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20",
                              !editingPackage.category ? "border-red-500/50" : ""
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('desc_label')}
                        </Label>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          {editingPackage.description?.length || 0}/200
                        </span>
                      </div>
                      <Textarea 
                        value={editingPackage.description}
                        onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value.slice(0, 200) })}
                        placeholder={t('desc_placeholder')}
                        rows={3}
                        maxLength={200}
                        className="bg-slate-50 dark:bg-slate-800/50 border-gray-700 resize-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      />
                    </div>

                    {/* Pricing Engine */}
                    {editingPackage.serviceIds.length > 0 && (
                      <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Percent className="w-4 h-4 text-emerald-400" />
                            {t('apply_discount', { percent: discountPercent })}
                          </Label>
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            Ahorro: ${savings}
                          </span>
                        </div>
                        
                        <div className="pt-2 pb-4">
                          <Slider 
                            value={[discountPercent]} 
                            max={50} 
                            min={0}
                            step={5}
                            onValueChange={(vals) => applyDiscountPercent(vals[0])}
                            className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
                          />
                        </div>

                        <div className="flex gap-3">
                          {getSuggestedPrices(realValue).map((sug, idx) => (
                            <Badge 
                              key={idx}
                              variant="outline" 
                              className="cursor-pointer hover:bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-400 flex-1 justify-center py-2 font-bold transition-all"
                              onClick={() => applySuggestedPrice(sug.price, sug.percent)}
                            >
                              {sug.label}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('manual_price')}
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
                            <Input 
                              type="number" 
                              min="0"
                              value={editingPackage.price || ''}
                              onChange={(e) => {
                                const newPrice = Number(e.target.value);
                                setEditingPackage({ ...editingPackage, price: newPrice });
                                const newPercent = calculateSavingsPercent(realValue, newPrice);
                                setDiscountPercent(Math.max(0, Math.min(100, newPercent)));
                              }}
                              className="bg-slate-50 dark:bg-slate-800/50 border-gray-700 pl-12 h-14 text-xl font-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Services Selection */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-gray-800 rounded-2xl p-6 flex flex-col h-full">
                    <Label className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                      <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {t('included_services', { count: editingPackage.serviceIds.length })}
                    </Label>
                    
                    {availableServices.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-800 rounded-2xl">
                        <AlertCircle className="w-10 h-10 text-amber-400 mb-4" />
                        <p className="text-base font-bold text-white mb-2">
                          {t('no_services')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t('no_services_desc')}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="flex-1 h-[350px] pr-3">
                        <div className="space-y-3">
                          {availableServices.map(service => {
                            const isSelected = editingPackage.serviceIds.includes(service.id);
                            
                            return (
                              <motion.div 
                                key={service.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                  isSelected 
                                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500/40 shadow-sm" 
                                    : "border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                                onClick={() => toggleServiceInPackage(service.id)}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleServiceInPackage(service.id)}
                                  className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white mb-1">
                                    {service.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                                      ${service.price}
                                    </Badge>
                                    {service.duration && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                        {service.duration} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-11"
              >
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 min-w-[160px] h-11 font-bold shadow-xl"
                disabled={!editingPackage?.serviceIds.length || !editingPackage?.name || editingPackage.price <= 0}
              >
                <Zap className="w-4 h-4 mr-2" />
                {t('save_package')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}