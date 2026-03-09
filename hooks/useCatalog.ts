// hooks/useCatalog.ts

import { useState, useCallback } from 'react';
import { catalogService } from '@/services/catalog.service';
import { storeService } from '@/services/store.service'; 
import { 
  UI_Service, 
  UI_Package, 
  UI_Product, // 🚀 NUEVO
  UI_Course,  // 🚀 NUEVO
  CatalogItemDTO, 
  ServiceModality, 
  ServiceDeliveryType, 
  CancellationPolicy 
} from '@/types/catalog';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useCatalog = () => {
  const [services, setServices] = useState<UI_Service[]>([]);
  const [packages, setPackages] = useState<UI_Package[]>([]);
  const [products, setProducts] = useState<UI_Product[]>([]); // 📦 NUEVO ESTADO
  const [courses, setCourses] = useState<UI_Course[]>([]);    // 🎓 NUEVO ESTADO
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- TRADUCTORES FRONT <-> BACK ---
  const mapModalityToDelivery = (modality?: ServiceModality): ServiceDeliveryType => {
    if (modality === 'ONLINE') return 'video_call';
    if (modality === 'HYBRID') return 'hybrid';
    return 'in_person';
  };

  const mapDeliveryToModality = (delivery: ServiceDeliveryType): ServiceModality => {
    if (delivery === 'video_call') return 'ONLINE';
    if (delivery === 'hybrid') return 'HYBRID';
    return 'IN_PERSON';
  };

  // --- CARGAR INVENTARIO COMPLETO ---
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await catalogService.getMyCatalog();

      // Separamos y formateamos los Servicios
      const loadedServices: UI_Service[] = items
        .filter(item => item.type === 'SERVICE')
        .map(item => ({
          id: item.id!,
          name: item.name,
          description: item.description || '',
          category: item.category || '', 
          price: item.price,
          duration: item.durationMinutes || 30,
          serviceDeliveryType: mapModalityToDelivery(item.modality),
          cancellationPolicy: (item.cancellationPolicy as CancellationPolicy) || 'flexible',
          followUpPeriodDays: item.followUpPeriodDays,
          imageUrl: item.imageUrl, 
          isNew: false,
          hasUnsavedChanges: false
        }));

      // Separamos y formateamos los Paquetes
      const loadedPackages: UI_Package[] = items
        .filter(item => item.type === 'PACKAGE')
        .map(item => ({
          id: item.id!,
          name: item.name,
          description: item.description || '',
          category: item.category || '', 
          price: item.price,
          serviceIds: item.packageContents ? item.packageContents.map(c => c.id) : [],
          imageUrl: item.imageUrl, 
          isNew: false,
          hasUnsavedChanges: false
        }));

      // 📦 NUEVO: Formateamos Productos Físicos
      const loadedProducts: UI_Product[] = items
        .filter(item => item.type === 'PRODUCT')
        .map(item => ({
          id: item.id!,
          name: item.name,
          description: item.description || '',
          category: item.category || '',
          price: item.price,
          stockQuantity: item.stockQuantity || 0,
          sku: item.sku || '',
          imageUrl: item.imageUrl,
          isNew: false,
          hasUnsavedChanges: false
        }));

      // 🎓 NUEVO: Formateamos Cursos
      const loadedCourses: UI_Course[] = items
        .filter(item => item.type === 'COURSE')
        .map(item => ({
          id: item.id!,
          name: item.name,
          description: item.description || '',
          category: item.category || '',
          price: item.price,
          contentUrl: item.contentUrl || '',
          imageUrl: item.imageUrl,
          isNew: false,
          hasUnsavedChanges: false
        }));

      setServices(loadedServices);
      setPackages(loadedPackages);
      setProducts(loadedProducts); // 🚀 Setear Productos
      setCourses(loadedCourses);   // 🚀 Setear Cursos

    } catch (error) {
      console.error("Error cargando inventario", error);
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- GESTIÓN DE SERVICIOS ---
  const saveService = async (service: UI_Service): Promise<UI_Service | null> => {
    const payload: CatalogItemDTO = {
      type: 'SERVICE',
      name: service.name,
      category: service.category, 
      description: service.description,
      price: service.price,
      durationMinutes: service.duration,
      modality: mapDeliveryToModality(service.serviceDeliveryType),
      cancellationPolicy: service.cancellationPolicy,
      followUpPeriodDays: service.followUpPeriodDays,
      imageUrl: service.imageUrl 
    };

    try {
      let savedItem: CatalogItemDTO;
      if (service.isNew) {
        savedItem = await catalogService.createItem(payload);
      } else {
        savedItem = await catalogService.updateItem(service.id, payload);
      }
      return { ...service, id: savedItem.id!, isNew: false, hasUnsavedChanges: false };
    } catch (error: any) {
      return;
      return null;
    }
  };

  const deleteService = async (id: number): Promise<boolean> => {
    try {
      await catalogService.deleteItem(id);
      return true;
    } catch (error) {
      return;
      return false;
    }
  };

  // --- GESTIÓN DE PAQUETES ---
  const savePackage = async (pkg: UI_Package): Promise<UI_Package | null> => {
    const payload: CatalogItemDTO = {
      type: 'PACKAGE',
      name: pkg.name,
      category: pkg.category, 
      description: pkg.description,
      price: pkg.price,
      packageItemIds: pkg.serviceIds,
      imageUrl: pkg.imageUrl 
    };

    try {
      let savedItem: CatalogItemDTO;
      if (pkg.isNew) {
        savedItem = await catalogService.createItem(payload);
      } else {
        savedItem = await catalogService.updateItem(pkg.id, payload);
      }
      return { ...pkg, id: savedItem.id!, isNew: false, hasUnsavedChanges: false };
    } catch (error: any) {
      return;
      return null;
    }
  };

  const deletePackage = async (id: number): Promise<boolean> => {
    try {
      await catalogService.deleteItem(id);
      return true;
    } catch (error) {
      return;
      return false;
    }
  };

  // 📦 --- GESTIÓN DE PRODUCTOS ---
  const saveProduct = async (product: UI_Product): Promise<UI_Product | null> => {
    const payload: CatalogItemDTO = {
      type: 'PRODUCT',
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      isDigital: false,
      imageUrl: product.imageUrl
    };

    try {
      let savedItem: CatalogItemDTO;
      if (product.isNew) {
        savedItem = await catalogService.createItem(payload);
      } else {
        savedItem = await catalogService.updateItem(product.id, payload);
      }
      return { ...product, id: savedItem.id!, isNew: false, hasUnsavedChanges: false };
    } catch (error: any) {
      return;
      return null;
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      await catalogService.deleteItem(id);
      return true;
    } catch (error) {
      return;
      return false;
    }
  };

  // 🎓 --- GESTIÓN DE CURSOS ---
  const saveCourse = async (course: UI_Course): Promise<UI_Course | null> => {
    const payload: CatalogItemDTO = {
      type: 'COURSE',
      name: course.name,
      category: course.category,
      description: course.description,
      price: course.price,
      contentUrl: course.contentUrl,
      isDigital: true,
      imageUrl: course.imageUrl
    };

    try {
      let savedItem: CatalogItemDTO;
      if (course.isNew) {
        savedItem = await catalogService.createItem(payload);
      } else {
        savedItem = await catalogService.updateItem(course.id, payload);
      }
      return { ...course, id: savedItem.id!, isNew: false, hasUnsavedChanges: false };
    } catch (error: any) {
      return;
      return null;
    }
  };

  const deleteCourse = async (id: number): Promise<boolean> => {
    try {
      await catalogService.deleteItem(id);
      return true;
    } catch (error) {
      return;
      return false;
    }
  };

  // 📸 --- SUBIDA A GCP ---
  const uploadItemImage = async (file: File): Promise<string | null> => {
    try {
      const response = await storeService.uploadMedia(file, 'ITEM_IMAGE' as any);
      return response.url;
    } catch (error) {
      console.error("Error en uploadItemImage", error);
      return;
      return null;
    }
  };

  return {
    services,
    setServices,
    packages,
    setPackages,
    products,       // 🚀 Exportado
    setProducts,    // 🚀 Exportado
    courses,        // 🚀 Exportado
    setCourses,     // 🚀 Exportado
    isLoading,
    fetchInventory,
    saveService,
    deleteService,
    savePackage,
    deletePackage,
    saveProduct,    // 🚀 Exportado
    deleteProduct,  // 🚀 Exportado
    saveCourse,     // 🚀 Exportado
    deleteCourse,   // 🚀 Exportado
    uploadItemImage 
  };
};