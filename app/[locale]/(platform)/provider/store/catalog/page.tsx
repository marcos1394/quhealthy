"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, BriefcaseMedical, Sparkles, Info, ShoppingBag, GraduationCap, Package } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";
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
    const wordCount = service.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t('toasts.validation_name', { defaultValue: 'El título debe tener al menos 3 palabras para un buen SEO.' }));
      return;
    }
    if ((service.description?.length || 0) < 150) {
      toast.warning(t('toasts.validation_desc', { defaultValue: 'La descripción debe tener al menos 150 caracteres.' }));
      return;
    }
    if (!service.imageUrl) {
      toast.warning(t('toasts.validation_image', { defaultValue: 'Debes incluir al menos una imagen de alta calidad.' }));
      return;
    }
    if (!service.requiresEvaluation && service.price <= 0) return;
    
    const saved = await saveService(service);
    if (saved) {
      setServices(prev => prev.map(s => s.id === service.id ? saved : s));
      refreshLimits(); // 🚀 Refrescamos límites
      toast.success(t('toasts.service_saved', { name: saved.name }));
    }
  };

 const handleDeleteService = async (id: number) => {
 const isInPackage = packages.some(pkg => (pkg.packageItems || []).some(item => item.id === id));
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
 id: -Date.now(), name: "", description: "", price: 0, packageItems: [], isNew: true, hasUnsavedChanges: true 
 };
 setPackages([newPackage, ...packages]);
 };

  const handleSavePackage = async (pkg: UI_Package) => {
    const wordCount = pkg.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t('toasts.validation_name', { defaultValue: 'El título debe tener al menos 3 palabras para un buen SEO.' }));
      return;
    }
    if ((pkg.description?.length || 0) < 150) {
      toast.warning(t('toasts.validation_desc', { defaultValue: 'La descripción debe tener al menos 150 caracteres.' }));
      return;
    }
    if (!pkg.imageUrl) {
      toast.warning(t('toasts.validation_image', { defaultValue: 'Debes incluir al menos una imagen de alta calidad.' }));
      return;
    }

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
 id: Date.now(), name: "", description: "", category: "", price: 0, stockQuantity: 1, 
 activeIngredient: "", manufacturer: "", requiresPrescription: false,
 isNew: true, hasUnsavedChanges: true,
 };
 setProducts([newProduct, ...products]);
 };

 const handleUpdateProduct = (id: number, updates: Partial<UI_Product>) => {
 setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, hasUnsavedChanges: true } : p));
 };

  const handleSaveProduct = async (product: UI_Product) => {
    const wordCount = product.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t('toasts.validation_name', { defaultValue: 'El título debe tener al menos 3 palabras para un buen SEO.' }));
      return;
    }
    if ((product.description?.length || 0) < 150) {
      toast.warning(t('toasts.validation_desc', { defaultValue: 'La descripción debe tener al menos 150 caracteres.' }));
      return;
    }
    if (!product.imageUrl) {
      toast.warning(t('toasts.validation_image', { defaultValue: 'Debes incluir al menos una imagen de alta calidad.' }));
      return;
    }

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
    const wordCount = course.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t('toasts.validation_name', { defaultValue: 'El título debe tener al menos 3 palabras para un buen SEO.' }));
      return;
    }
    if ((course.description?.length || 0) < 150) {
      toast.warning(t('toasts.validation_desc', { defaultValue: 'La descripción debe tener al menos 150 caracteres.' }));
      return;
    }
    if (!course.imageUrl) {
      toast.warning(t('toasts.validation_image', { defaultValue: 'Debes incluir al menos una imagen de alta calidad.' }));
      return;
    }

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
 <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
 {t('loading_subtitle', { defaultValue: 'Preparando tu inventario...' })}
 </p>
 </div>
 );
 }

 const hasUnsavedChanges = services.some(s => s.hasUnsavedChanges || s.isNew) || packages.some(p => p.hasUnsavedChanges || p.isNew);
 const availableServicesForPackages = services.filter(s => !s.isNew && !s.hasUnsavedChanges);

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] p-6 md:p-12 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <div className="max-w-6xl mx-auto space-y-12 pb-24">

 {/* 🚀 Top Bar Navigation (Blueprint) */}
 <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 sticky top-0 bg-white dark:bg-[#0a0a0a] z-40 pt-4">
 <Button
 variant="ghost"
 onClick={() => router.push('/provider/store')}
 className="rounded-none text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors px-4"
 >
 <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={2} />
 {t('back', { defaultValue: 'Volver' })}
 </Button>

 {hasUnsavedChanges && (
 <span className="border border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
 <Info className="w-3.5 h-3.5" strokeWidth={2} /> {t('unsaved', { defaultValue: 'Cambios sin guardar' })}
 </span>
 )}
 </div>

 {/* Header Contextual */}
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
 <div className="flex flex-col md:flex-row md:items-center gap-6">
 <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
 <ShoppingBag className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-3">
 {t('title', { defaultValue: 'Catálogo de Precios' })}
 </h1>
 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
 <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
 <Sparkles className="w-3 h-3" strokeWidth={2} /> {t('badge', { defaultValue: 'Inventario Unificado' })}
 </span>
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {services.length + packages.length + products.length + courses.length} Ítems Activos
 </span>
 </div>
 </div>
 </div>
 <p className="text-xs text-gray-500 font-light leading-relaxed max-w-2xl mt-4">
 {t('subtitle', { defaultValue: 'Configura los servicios, paquetes, productos y cursos que ofrecerás a tus pacientes.' })}
 </p>
 </motion.div>

 {/* 🚀 NAVEGACIÓN DE PESTAÑAS (TABS ARCHITECTURAL) */}
 <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 scrollbar-hide">
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
 "flex items-center gap-3 px-6 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800",
 activeTab === tab.id
 ? "bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-t-2 border-t-black dark:border-t-white"
 : "bg-gray-50 dark:bg-[#050505] text-gray-500 hover:text-black dark:hover:text-white border-t-2 border-t-transparent hover:bg-white dark:hover:bg-[#0a0a0a]"
 )}
 >
 <tab.icon className="w-4 h-4" strokeWidth={1.5} />
 {tab.label}
 <span className={cn(
 "border px-1.5 py-0.5 text-[9px]",
 activeTab === tab.id ? "border-black dark:border-white" : "border-gray-300 dark:border-gray-700"
 )}>
 {tab.count}
 </span>
 </button>
 ))}
 </div>

 {/* 🚀 CONTENIDO DE LAS PESTAÑAS (Enviando Banderas) */}
 <div className="border border-t-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] -mt-12 pt-12">
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
 onAdd={handleAddPackage} 
 onSave={handleSavePackage}
 onDelete={handleDeletePackage}
 onImageUpload={(id, file) => handleImageUpload(id, file, 'PACKAGES')}
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