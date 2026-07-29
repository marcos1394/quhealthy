"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  BriefcaseMedical,
  Sparkles,
  Info,
  ShoppingBag,
  GraduationCap,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Managers
import { ServicesManager } from "@/components/marketplace/ServicesManager";
import { PackagesManager } from "@/components/marketplace/PackagesManager";
import { ProductsManager } from "@/components/marketplace/ProductsManager";
import { CoursesManager } from "@/components/marketplace/CoursesManager";

// Hook y Tipos
import { useCatalog } from "@/hooks/useCatalog";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import {
  UI_Service,
  UI_Package,
  UI_Product,
  UI_Course,
} from "@/types/catalog";
import { cn } from "@/lib/utils";

type TabType = "SERVICES" | "PACKAGES" | "PRODUCTS" | "COURSES";

export default function CatalogSetupPage() {
  const router = useRouter();
  const t = useTranslations("StoreCatalog");

  const [activeTab, setActiveTab] = useState<TabType>("SERVICES");

  // Hook central de Catálogo
  const {
    services,
    setServices,
    saveService,
    deleteService,
    packages,
    setPackages,
    savePackage,
    deletePackage,
    products,
    setProducts,
    saveProduct,
    deleteProduct,
    courses,
    setCourses,
    saveCourse,
    deleteCourse,
    isLoading,
    fetchInventory,
    uploadItemImage,
  } = useCatalog();

  // Hook central de Límites de Plan
  const { usage, isLoadingLimits, refreshLimits } = usePlanLimits();

  // Reglas de negocio dinámicas
  const canAddService = usage?.metrics?.services?.canAdd ?? true;
  const canAddPackage = usage?.metrics?.packages?.canAdd ?? true;
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
      toast.warning(t("toasts.limit_reached"));
      return;
    }
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
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, hasUnsavedChanges: true } : s
      )
    );
  };

  const handleSaveService = async (service: UI_Service) => {
    const wordCount = service.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t("toasts.validation_name"));
      return;
    }
    if ((service.description?.length || 0) < 150) {
      toast.warning(t("toasts.validation_desc"));
      return;
    }
    if (!service.imageUrl) {
      toast.warning(t("toasts.validation_image"));
      return;
    }
    if (!service.requiresEvaluation && service.price <= 0) return;

    const saved = await saveService(service);
    if (saved) {
      setServices((prev) => prev.map((s) => (s.id === service.id ? saved : s)));
      refreshLimits();
      toast.success(t("toasts.service_saved", { name: saved.name }));
    }
  };

  const handleDeleteService = async (id: number) => {
    const isInPackage = packages.some((pkg) =>
      (pkg.packageItems || []).some((item) => item.id === id)
    );
    if (isInPackage) {
      toast.warning(t("toasts.service_in_package"));
      return;
    }
    const s = services.find((serv) => serv.id === id);
    if (!s) return;
    if (s.isNew) return setServices((prev) => prev.filter((serv) => serv.id !== id));

    if (await deleteService(id)) {
      setServices((prev) => prev.filter((serv) => serv.id !== id));
      refreshLimits();
      toast.success(t("toasts.service_deleted"));
    }
  };

  const handleDuplicateService = (service: UI_Service) => {
    if (!canAddService) {
      toast.warning(t("toasts.limit_reached"));
      return;
    }
    const duplicated: UI_Service = {
      ...service,
      id: Date.now(),
      name: `${service.name} (Copia)`,
      imageUrl: undefined,
      isNew: true,
      hasUnsavedChanges: true,
    };
    const index = services.findIndex((s) => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicated);
    setServices(newServices);
  };

  // ==========================================
  // HANDLERS: PAQUETES
  // ==========================================
  const handleAddPackage = () => {
    if (!canAddPackage) {
      toast.warning(t("toasts.limit_reached"));
      return;
    }
    const newPackage: UI_Package = {
      id: -Date.now(),
      name: "",
      description: "",
      price: 0,
      packageItems: [],
      isNew: true,
      hasUnsavedChanges: true,
    };
    setPackages([newPackage, ...packages]);
  };

  const handleSavePackage = async (pkg: UI_Package): Promise<boolean> => {
    const wordCount = pkg.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t("toasts.validation_name"));
      return false;
    }
    if ((pkg.description?.length || 0) < 150) {
      toast.warning(t("toasts.validation_desc"));
      return false;
    }

    const saved = await savePackage(pkg);
    if (saved) {
      if (pkg.isNew)
        setPackages((prev) => [saved, ...prev.filter((p) => p.id !== pkg.id)]);
      else setPackages((prev) => prev.map((p) => (p.id === pkg.id ? saved : p)));
      refreshLimits();
      toast.success(t("toasts.package_saved"));
      return true;
    }
    return false;
  };

  const handleDeletePackage = async (id: number) => {
    const p = packages.find((pkg) => pkg.id === id);
    if (!p) return;
    if (p.isNew) return setPackages((prev) => prev.filter((pkg) => pkg.id !== id));

    if (await deletePackage(id)) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      refreshLimits();
      toast.success(t("toasts.package_deleted"));
    }
  };

  // ==========================================
  // HANDLERS: PRODUCTOS
  // ==========================================
  const handleAddProduct = () => {
    if (!canAddProduct) {
      toast.warning(t("toasts.limit_reached"));
      return;
    }
    const newProduct: UI_Product = {
      id: Date.now(),
      name: "",
      description: "",
      category: "",
      price: 0,
      stockQuantity: 1,
      activeIngredient: "",
      manufacturer: "",
      requiresPrescription: false,
      isNew: true,
      hasUnsavedChanges: true,
    };
    setProducts([newProduct, ...products]);
  };

  const handleUpdateProduct = (id: number, updates: Partial<UI_Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, hasUnsavedChanges: true } : p))
    );
  };

  const handleSaveProduct = async (product: UI_Product) => {
    const wordCount = product.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t("toasts.validation_name"));
      return;
    }
    if ((product.description?.length || 0) < 150) {
      toast.warning(t("toasts.validation_desc"));
      return;
    }
    if (!product.imageUrl) {
      toast.warning(t("toasts.validation_image"));
      return;
    }

    const saved = await saveProduct(product);
    if (saved) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? saved : p)));
      refreshLimits();
      toast.success(t("toasts.product_saved"));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;
    if (p.isNew) return setProducts((prev) => prev.filter((prod) => prod.id !== id));

    if (await deleteProduct(id)) {
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
      refreshLimits();
      toast.success(t("toasts.product_deleted"));
    }
  };

  // ==========================================
  // HANDLERS: CURSOS
  // ==========================================
  const handleAddCourse = () => {
    if (!canAddCourse) {
      toast.warning(t("toasts.limit_reached"));
      return;
    }
    const newCourse: UI_Course = {
      id: Date.now(),
      name: "",
      description: "",
      category: "",
      price: 0,
      contentUrl: "",
      isNew: true,
      hasUnsavedChanges: true,
    };
    setCourses([newCourse, ...courses]);
  };

  const handleUpdateCourse = (id: number, updates: Partial<UI_Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, hasUnsavedChanges: true } : c))
    );
  };

  const handleSaveCourse = async (course: UI_Course) => {
    const wordCount = course.name.trim().split(/\s+/).length;
    if (wordCount < 3) {
      toast.warning(t("toasts.validation_name"));
      return;
    }
    if ((course.description?.length || 0) < 150) {
      toast.warning(t("toasts.validation_desc"));
      return;
    }
    if (!course.imageUrl) {
      toast.warning(t("toasts.validation_image"));
      return;
    }

    const saved = await saveCourse(course);
    if (saved) {
      setCourses((prev) => prev.map((c) => (c.id === course.id ? saved : c)));
      refreshLimits();
      toast.success(t("toasts.course_saved"));
    }
  };

  const handleDeleteCourse = async (id: number) => {
    const c = courses.find((crs) => crs.id === id);
    if (!c) return;
    if (c.isNew) return setCourses((prev) => prev.filter((crs) => crs.id !== id));

    if (await deleteCourse(id)) {
      setCourses((prev) => prev.filter((crs) => crs.id !== id));
      refreshLimits();
      toast.success(t("toasts.course_deleted"));
    }
  };

  // ==========================================
  // UPLOAD IMÁGENES (GENÉRICO)
  // ==========================================
  const handleImageUpload = async (id: number, file: File, type: TabType) => {
    const newUrl = await uploadItemImage(file);
    if (!newUrl) return;

    if (type === "SERVICES") {
      handleUpdateService(id, { imageUrl: newUrl });
    } else if (type === "PACKAGES") {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, imageUrl: newUrl, hasUnsavedChanges: true } : p
        )
      );
    } else if (type === "PRODUCTS") {
      handleUpdateProduct(id, { imageUrl: newUrl });
    } else if (type === "COURSES") {
      handleUpdateCourse(id, { imageUrl: newUrl });
    }
    toast.success(t("toasts.image_uploaded"));
  };

  // ==========================================
  // RENDER: ESTADO DE CARGA
  // ==========================================
  if (isLoading || isLoadingLimits) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading_subtitle")}
        </p>
      </div>
    );
  }

  const hasUnsavedChanges =
    services.some((s) => s.hasUnsavedChanges || s.isNew) ||
    packages.some((p) => p.hasUnsavedChanges || p.isNew);

  const availableServicesForPackages = services.filter(
    (s) => !s.isNew && !s.hasUnsavedChanges
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Barra Superior NAVEGACIÓN */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.push("/provider/store")}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200" strokeWidth={2} />
            <span>{t("back")}</span>
          </Button>

          {hasUnsavedChanges && (
            <span className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
              <Info className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("unsaved")}</span>
            </span>
          )}
        </div>

        {/* Encabezado Principal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  {t("title")}
                </h1>
                <span className="px-3 py-0.5 text-[10px] font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2} />
                  <span>{t("badge")}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center bg-gray-50/50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto custom-scrollbar">
            {[
              {
                id: "SERVICES",
                label: t("tabs.services"),
                icon: BriefcaseMedical,
                count: services.length,
              },
              {
                id: "PACKAGES",
                label: t("tabs.packages"),
                icon: Package,
                count: packages.length,
              },
              {
                id: "PRODUCTS",
                label: t("tabs.products"),
                icon: ShoppingBag,
                count: products.length,
              },
              {
                id: "COURSES",
                label: t("tabs.courses"),
                icon: GraduationCap,
                count: courses.length,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "h-10 px-5 rounded-xl border transition-all text-xs font-bold flex items-center justify-center gap-2 shrink-0 relative",
                    isActive
                      ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-transparent"
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CONTENIDO DE PESTAÑA SELECCIONADA */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === "SERVICES" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ServicesManager
                    // @ts-ignore
                    services={services}
                    onAdd={handleAddService}
                    onUpdate={handleUpdateService}
                    onSave={handleSaveService}
                    onDelete={handleDeleteService}
                    onDuplicate={handleDuplicateService}
                    onImageUpload={(id, file) =>
                      handleImageUpload(id, file, "SERVICES")
                    }
                    canAdd={canAddService}
                    currentUsage={usage?.metrics?.services?.current}
                    maxLimit={usage?.metrics?.services?.limit}
                  />
                </motion.div>
              )}

              {activeTab === "PACKAGES" && (
                <motion.div
                  key="packages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PackagesManager
                    // @ts-ignore
                    packages={packages}
                    // @ts-ignore
                    availableServices={availableServicesForPackages}
                    onAdd={handleAddPackage}
                    onSave={handleSavePackage}
                    onDelete={handleDeletePackage}
                    onImageUpload={(id, file) =>
                      handleImageUpload(id, file, "PACKAGES")
                    }
                    canAdd={canAddPackage}
                    currentUsage={usage?.metrics?.packages?.current}
                    maxLimit={usage?.metrics?.packages?.limit}
                  />
                </motion.div>
              )}

              {activeTab === "PRODUCTS" && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductsManager
                    // @ts-ignore
                    products={products}
                    onAdd={handleAddProduct}
                    onUpdate={handleUpdateProduct}
                    onSave={handleSaveProduct}
                    onDelete={handleDeleteProduct}
                    onImageUpload={(id, file) =>
                      handleImageUpload(id, file, "PRODUCTS")
                    }
                    canAdd={canAddProduct}
                    currentUsage={usage?.metrics?.products?.current ?? 0}
                    maxLimit={usage?.metrics?.products?.limit ?? undefined}
                  />
                </motion.div>
              )}

              {activeTab === "COURSES" && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CoursesManager
                    // @ts-ignore
                    courses={courses}
                    onAdd={handleAddCourse}
                    onUpdate={handleUpdateCourse}
                    onSave={handleSaveCourse}
                    onDelete={handleDeleteCourse}
                    onImageUpload={(id, file) =>
                      handleImageUpload(id, file, "COURSES")
                    }
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
    </div>
  );
}