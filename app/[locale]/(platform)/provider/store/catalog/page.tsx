"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, BriefcaseMedical, Sparkles, Info, ShoppingBag, GraduationCap, Package } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Importamos los Managers
import { ServicesManager } from "@/components/marketplace/ServicesManager";
import { PackagesManager } from "@/components/marketplace/PackagesManager";
import { ProductsManager } from "@/components/marketplace/ProductsManager";
import { CoursesManager } from "@/components/marketplace/CoursesManager";

// Importamos el Hook y los Tipos
import { useCatalog } from "@/hooks/useCatalog";
import { usePlanLimits } from "@/hooks/usePlanLimits"; // 🚀 Nuevo Hook de límites
import { UI_Service, UI_Package, UI_Product, UI_Course } from "@/types/catalog";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/lib/handleApiError';

type TabType = 'SERVICES' | 'PACKAGES' | 'PRODUCTS' | 'COURSES';

export default function CatalogSetupPage() {
  const router = useRouter();
  const t = useTranslations('StoreCatalog');

  const [activeTab, setActiveTab] = useState<TabType>('SERVICES');

  // Hook central de Catálogo
  const {
    services, setServices, saveService, deleteService,
    packages, setPackages, savePackage, deletePackage,
    products, setProducts, saveProduct, deleteProduct,
    courses, setCourses, saveCourse, deleteCourse,
    isLoading, fetchInventory, uploadItemImage
  } = useCatalog();

  // 🚀 Hook central de Límites de Plan
  const { usage, isLoadingLimits, refreshLimits } = usePlanLimits();

  // 🚀 REGLAS DE NEGOCIO DINÁMICAS (Si el backend no lo envía, asumimos true para no bloquear por error)
  const canAddService = usage?.metrics?.services?.canAdd ?? true;
  const canAddPackage = usage?.metrics?.packages?.canAdd ?? true;
  // Nota: Si luego agregas "products" y "courses" al backend, esto los leerá automáticamente
  const canAddProduct = usage?.metrics?.products?.canAdd ?? true;
  const canAddCourse = usage?.metrics?.courses?.canAdd ?? true;

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ==========================================
  // HANDLERS: SERVICIOS
  // ==========================================
  const handleAddService = () => {
    if (!canAddService) {
      toast.warning(t('toasts.limit_reached', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }
    const newService: UI_Service = {
      id: Date.now(), name: "", description: "", category: "", duration: 30, price: 0,
      serviceDeliveryType: "in_person", cancellationPolicy: "flexible", isNew: true, hasUnsavedChanges: true,
    };
    setServices([newService, ...services]);
  };

  const handleUpdateService = (id: number, updates: Partial<UI_Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates, hasUnsavedChanges: true } : s));
  };

  const handleSaveService = async (service: UI_Service) => {
    if (!service.name || service.price <= 0) return;
    const saved = await saveService(service);
    if (saved) {
      setServices(prev => prev.map(s => s.id === service.id ? saved : s));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.service_saved', { name: saved.name }));
    }
  };

  const handleDeleteService = async (id: number) => {
    const isInPackage = packages.some(pkg => pkg.serviceIds.includes(id));
    if (isInPackage) return;
    const s = services.find(s => s.id === id);
    if (!s) return;
    if (s.isNew) return setServices(prev => prev.filter(s => s.id !== id));

    if (await deleteService(id)) {
      setServices(prev => prev.filter(s => s.id !== id));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.service_deleted', { defaultValue: 'Servicio eliminado' }));
    }
  };

  const handleDuplicateService = (service: UI_Service) => {
    if (!canAddService) {
      toast.warning(t('toasts.limit_reached', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }
    const duplicated: UI_Service = { ...service, id: Date.now(), name: `${service.name} (Copia)`, imageUrl: undefined, isNew: true, hasUnsavedChanges: true };
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicated);
    setServices(newServices);
  };

  // ==========================================
  // HANDLERS: PAQUETES
  // ==========================================
  const handleAddPackage = () => {
    if (!canAddPackage) {
      toast.warning(t('toasts.limit_reached', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }
    const newPackage: UI_Package = {
      id: Date.now(), name: "", description: "", price: 0, serviceIds: [], isNew: true, hasUnsavedChanges: true,
    };
    setPackages([newPackage, ...packages]);
  };

  const handleSavePackage = async (pkg: UI_Package) => {
    const saved = await savePackage(pkg);
    if (saved) {
      if (pkg.isNew) setPackages(prev => [saved, ...prev.filter(p => p.id !== pkg.id)]);
      else setPackages(prev => prev.map(p => p.id === pkg.id ? saved : p));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.package_saved', { defaultValue: 'Paquete guardado' }));
    }
  };

  const handleDeletePackage = async (id: number) => {
    const p = packages.find(p => p.id === id);
    if (!p) return;
    if (p.isNew) return setPackages(prev => prev.filter(p => p.id !== id));

    if (await deletePackage(id)) {
      setPackages(prev => prev.filter(p => p.id !== id));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.package_deleted', { defaultValue: 'Paquete eliminado' }));
    }
  };

  // ==========================================
  // HANDLERS: PRODUCTOS
  // ==========================================
  const handleAddProduct = () => {
    if (!canAddProduct) {
      toast.warning(t('toasts.limit_reached', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }
    const newProduct: UI_Product = {
      id: Date.now(), name: "", description: "", category: "", price: 0, stockQuantity: 1, isNew: true, hasUnsavedChanges: true,
    };
    setProducts([newProduct, ...products]);
  };

  const handleUpdateProduct = (id: number, updates: Partial<UI_Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, hasUnsavedChanges: true } : p));
  };

  const handleSaveProduct = async (product: UI_Product) => {
    const saved = await saveProduct(product);
    if (saved) {
      setProducts(prev => prev.map(p => p.id === product.id ? saved : p));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.product_saved', { defaultValue: 'Producto guardado' }));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const p = products.find(p => p.id === id);
    if (!p) return;
    if (p.isNew) return setProducts(prev => prev.filter(p => p.id !== id));
    if (await deleteProduct(id)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.product_deleted', { defaultValue: 'Producto eliminado' }));
    }
  };

  // ==========================================
  // HANDLERS: CURSOS
  // ==========================================
  const handleAddCourse = () => {
    if (!canAddCourse) {
      toast.warning(t('toasts.limit_reached', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }
    const newCourse: UI_Course = {
      id: Date.now(), name: "", description: "", category: "", price: 0, contentUrl: "", isNew: true, hasUnsavedChanges: true,
    };
    setCourses([newCourse, ...courses]);
  };

  const handleUpdateCourse = (id: number, updates: Partial<UI_Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates, hasUnsavedChanges: true } : c));
  };

  const handleSaveCourse = async (course: UI_Course) => {
    const saved = await saveCourse(course);
    if (saved) {
      setCourses(prev => prev.map(c => c.id === course.id ? saved : c));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.course_saved', { defaultValue: 'Curso guardado' }));
    }
  };

  const handleDeleteCourse = async (id: number) => {
    const c = courses.find(c => c.id === id);
    if (!c) return;
    if (c.isNew) return setCourses(prev => prev.filter(c => c.id !== id));
    if (await deleteCourse(id)) {
      setCourses(prev => prev.filter(c => c.id !== id));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.course_deleted', { defaultValue: 'Curso eliminado' }));
    }
  };

  // ==========================================
  // UPLOAD IMÁGENES (GENÉRICO)
  // ==========================================
  const handleImageUpload = async (id: number, file: File, type: TabType) => {
    const newUrl = await uploadItemImage(file);
    if (!newUrl) return;

    if (type === 'SERVICES') {
      handleUpdateService(id, { imageUrl: newUrl });
    } else if (type === 'PACKAGES') {
      setPackages(prev => prev.map(p => p.id === id ? { ...p, imageUrl: newUrl, hasUnsavedChanges: true } : p));
    } else if (type === 'PRODUCTS') {
      handleUpdateProduct(id, { imageUrl: newUrl });
    } else if (type === 'COURSES') {
      handleUpdateCourse(id, { imageUrl: newUrl });
    }
    toast.success(t('toasts.image_uploaded', { defaultValue: 'Imagen subida correctamente' }));
  };

  // ==========================================
  // RENDER: LOADING STATE (Sincronizado)
  // ==========================================
  if (isLoading || isLoadingLimits) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-6 bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <div className="text-center space-y-2">
          <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">{t('loading_title', { defaultValue: 'Cargando Catálogo' })}</p>
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">{t('loading_subtitle', { defaultValue: 'Preparando tu inventario...' })}</p>
        </div>
      </div>
    );
  }

  const hasUnsavedChanges = services.some(s => s.hasUnsavedChanges || s.isNew) || packages.some(p => p.hasUnsavedChanges || p.isNew);
  const availableServicesForPackages = services.filter(s => !s.isNew && !s.hasUnsavedChanges);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">

        {/* Sticky Top Bar Navigation */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-20 z-40 backdrop-blur-xl">
          <Card className="bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/provider/store')} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {t('back', { defaultValue: 'Volver' })}
                </Button>

                {hasUnsavedChanges && (
                  <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 animate-pulse">
                    <Info className="w-3 h-3 mr-1" /> {t('unsaved', { defaultValue: 'Cambios sin guardar' })}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header Contextual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title', { defaultValue: 'Catálogo de Precios' })}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20">
                  <Sparkles className="w-3 h-3 mr-1" /> {t('badge', { defaultValue: 'Inventario Unificado' })}
                </Badge>
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  {services.length + packages.length + products.length + courses.length} Ítems Activos
                </span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
            {t('subtitle', { defaultValue: 'Configura los servicios, paquetes, productos y cursos que ofrecerás a tus pacientes.' })}
          </p>
        </motion.div>

        {/* 🚀 NAVEGACIÓN DE PESTAÑAS (TABS) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'SERVICES', label: 'Servicios', icon: BriefcaseMedical, count: services.length },
            { id: 'PACKAGES', label: 'Paquetes', icon: Package, count: packages.length },
            { id: 'PRODUCTS', label: 'Farmacia / Productos', icon: ShoppingBag, count: products.length },
            { id: 'COURSES', label: 'Cursos / Digitales', icon: GraduationCap, count: courses.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-b-2",
                activeTab === tab.id
                  ? "border-medical-600 text-medical-700 dark:text-medical-400 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-medical-600 dark:text-medical-400" : "")} />
              {tab.label}
              <Badge variant="secondary" className={cn("ml-2", activeTab === tab.id ? "bg-medical-100 dark:bg-medical-900/40 text-medical-700 dark:text-medical-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* 🚀 CONTENIDO DE LAS PESTAÑAS (Enviando Banderas) */}
        <div className="pt-4">
          <AnimatePresence mode="wait">

            {activeTab === 'SERVICES' && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ServicesManager
                  // @ts-ignore
                  services={services}
                  onAdd={handleAddService}
                  onUpdate={handleUpdateService}
                  onSave={handleSaveService}
                  onDelete={handleDeleteService}
                  onDuplicate={handleDuplicateService}
                  onImageUpload={(id, file) => handleImageUpload(id, file, 'SERVICES')}
                  // 🚀 Props de negocio agregadas
                  canAdd={canAddService}
                  currentUsage={usage?.metrics?.services?.current}
                  maxLimit={usage?.metrics?.services?.limit}
                />
              </motion.div>
            )}

            {activeTab === 'PACKAGES' && (
              <motion.div key="packages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <PackagesManager
                  // @ts-ignore
                  packages={packages}
                  // @ts-ignore
                  availableServices={availableServicesForPackages}
                  onAdd={handleAddPackage} // Aseguramos inyectar onAdd
                  onSave={handleSavePackage}
                  onDelete={handleDeletePackage}
                  onImageUpload={(id, file) => handleImageUpload(id, file, 'PACKAGES')}
                  // 🚀 Props de negocio agregadas
                  canAdd={canAddPackage}
                  currentUsage={usage?.metrics?.packages?.current}
                  maxLimit={usage?.metrics?.packages?.limit}
                />
              </motion.div>
            )}

            {activeTab === 'PRODUCTS' && (
              <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ProductsManager
                  // @ts-ignore
                  products={products}
                  onAdd={handleAddProduct}
                  onUpdate={handleUpdateProduct}
                  onSave={handleSaveProduct}
                  onDelete={handleDeleteProduct}
                  onImageUpload={(id, file) => handleImageUpload(id, file, 'PRODUCTS')}
                  // 🚀 Props de negocio agregadas
                  canAdd={canAddProduct}
                  currentUsage={usage?.metrics?.products?.current ?? 0}
                  maxLimit={usage?.metrics?.products?.limit ?? undefined}
                />
              </motion.div>
            )}

            {activeTab === 'COURSES' && (
              <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <CoursesManager
                  // @ts-ignore
                  courses={courses}
                  onAdd={handleAddCourse}
                  onUpdate={handleUpdateCourse}
                  onSave={handleSaveCourse}
                  onDelete={handleDeleteCourse}
                  onImageUpload={(id, file) => handleImageUpload(id, file, 'COURSES')}
                  // 🚀 Props de negocio agregadas
                  canAdd={canAddCourse}
                  currentUsage={usage?.metrics?.courses?.current ?? 0}
                  maxLimit={usage?.metrics?.courses?.limit ?? undefined}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}