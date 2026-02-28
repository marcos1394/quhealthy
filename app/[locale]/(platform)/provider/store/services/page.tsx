"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, BriefcaseMedical, Sparkles, Info } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Importamos los dos Managers
import { ServicesManager } from "@/components/marketplace/ServicesManager";
import { PackagesManager } from "@/components/marketplace/PackagesManager";

// Importamos el Hook y los Tipos
import { useCatalog } from "@/hooks/useCatalog";
import { UI_Service, UI_Package } from "@/types/catalog";
import { cn } from "@/lib/utils";

export default function ServicesSetupPage() {
  const router = useRouter();
  const t = useTranslations('StoreCatalog');

  // Hook central
  const {
    services,
    setServices,
    packages,
    setPackages,
    isLoading,
    fetchInventory,
    saveService,
    deleteService,
    savePackage,
    deletePackage,
    uploadItemImage
  } = useCatalog();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handlers: Servicios
  const handleAddService = () => {
    const newService: UI_Service = {
      id: Date.now(),
      name: "",
      description: "",
      category: "",
      duration: 30,
      price: 0,
      serviceDeliveryType: "in_person",
      cancellationPolicy: "flexible",
      isNew: true,
      hasUnsavedChanges: true,
    };
    setServices([newService, ...services]);
  };

  const handleUpdateService = (id: number, updates: Partial<UI_Service>) => {
    setServices(prev =>
      prev.map(s => s.id === id ? { ...s, ...updates, hasUnsavedChanges: true } : s)
    );
  };

  const handleSaveService = async (service: UI_Service) => {
    if (!service.name || service.price <= 0) {
      toast.error(t('toast_name_price_required'));
      return;
    }
    const saved = await saveService(service);
    if (saved) {
      setServices(prev => prev.map(s => s.id === service.id ? saved : s));
      toast.success(t('toast_service_saved', { name: saved.name }));
    }
  };

  const handleDeleteService = async (id: number) => {
    const isInPackage = packages.some(pkg => pkg.serviceIds.includes(id));
    if (isInPackage) {
      toast.error(t('toast_service_in_package'));
      return;
    }

    const serviceToDelete = services.find(s => s.id === id);
    if (!serviceToDelete) return;

    if (serviceToDelete.isNew) {
      setServices(prev => prev.filter(s => s.id !== id));
      return;
    }

    const success = await deleteService(id);
    if (success) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success(t('toast_service_deleted'));
    }
  };

  const handleDuplicateService = (service: UI_Service) => {
    const duplicatedService: UI_Service = {
      ...service,
      id: Date.now(),
      name: `${service.name} (Copia)`,
      imageUrl: undefined,
      isNew: true,
      hasUnsavedChanges: true,
    };
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicatedService);
    setServices(newServices);
  };

  const handleServiceImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadItemImage(file);
    if (newUrl) {
      handleUpdateService(id, { imageUrl: newUrl });
      toast.success(t('toast_service_image'));
    }
  };

  // Handlers: Paquetes
  const handleSavePackage = async (pkg: UI_Package) => {
    const saved = await savePackage(pkg);
    if (saved) {
      if (pkg.isNew) {
        setPackages(prev => [saved, ...prev.filter(p => p.id !== pkg.id)]);
      } else {
        setPackages(prev => prev.map(p => p.id === pkg.id ? saved : p));
      }
      toast.success(t('toast_package_saved'));
    }
  };

  const handleDeletePackage = async (id: number) => {
    const pkgToDelete = packages.find(p => p.id === id);
    if (!pkgToDelete) return;

    if (pkgToDelete.isNew) {
      setPackages(prev => prev.filter(p => p.id !== id));
      return;
    }

    const success = await deletePackage(id);
    if (success) {
      setPackages(prev => prev.filter(p => p.id !== id));
      toast.success(t('toast_package_deleted'));
    }
  };

  const handlePackageImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadItemImage(file);
    if (newUrl) {
      setPackages(prev => prev.map(p =>
        p.id === id ? { ...p, imageUrl: newUrl, hasUnsavedChanges: true } : p
      ));
      toast.success(t('toast_package_image'));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-6 bg-slate-50 dark:bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-16 h-16 text-medical-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">{t('loading_title')}</p>
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">{t('loading_subtitle')}</p>
        </div>
      </div>
    );
  }

  const hasUnsavedServices = services.some(s => s.hasUnsavedChanges || s.isNew);
  const availableServicesForPackages = services.filter(s => !s.isNew && !s.hasUnsavedChanges);

  const servicesCountText = services.length === 1
    ? t('count_services', { count: services.length })
    : t('count_services_plural', { count: services.length });
  const packagesCountText = packages.length === 1
    ? t('count_packages', { count: packages.length })
    : t('count_packages_plural', { count: packages.length });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">

        {/* Sticky Top Bar Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 z-40 backdrop-blur-xl"
        >
          <Card className="bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/provider/store')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {t('back')}
                </Button>

                {hasUnsavedServices && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 animate-pulse">
                      <Info className="w-3 h-3 mr-1" />
                      {t('unsaved')}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header Contextual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <BriefcaseMedical className="w-10 h-10 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title')}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t('badge')}
                </Badge>
                {services.length > 0 && (
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {servicesCountText}
                  </span>
                )}
                {packages.length > 0 && (
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    • {packagesCountText}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Sección 1: Servicios Individuales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ServicesManager
            // @ts-ignore
            services={services}
            onAdd={handleAddService}
            onUpdate={handleUpdateService}
            onSave={handleSaveService}
            onDelete={handleDeleteService}
            onDuplicate={handleDuplicateService}
            onImageUpload={handleServiceImageUpload}
          />
        </motion.div>

        {/* Separador Visual Elegante */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center py-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-medical-300 dark:via-medical-500/30 to-transparent w-full max-w-2xl" />
        </motion.div>

        {/* Sección 2: Paquetes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PackagesManager
            // @ts-ignore
            packages={packages}
            // @ts-ignore
            availableServices={availableServicesForPackages}
            onSave={handleSavePackage}
            onDelete={handleDeletePackage}
            onImageUpload={handlePackageImageUpload}
          />
        </motion.div>

      </div>
    </div>
  );
}