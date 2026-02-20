// hooks/useCatalog.ts
import { useState, useCallback } from 'react';
import { catalogService } from '@/services/catalog.service';
import { storeService } from '@/services/store.service'; // 📸 Requerido para subir a GCP
import { UI_Service, UI_Package, CatalogItemDTO, ServiceModality, ServiceDeliveryType, CancellationPolicy } from '@/types/catalog';
import { toast } from 'react-toastify';

export const useCatalog = () => {
  const [services, setServices] = useState<UI_Service[]>([]);
  const [packages, setPackages] = useState<UI_Package[]>([]);
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

  // --- CARGAR INVENTARIO ---
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
          price: item.price,
          duration: item.durationMinutes || 30,
          serviceDeliveryType: mapModalityToDelivery(item.modality),
          cancellationPolicy: (item.cancellationPolicy as CancellationPolicy) || 'flexible',
          followUpPeriodDays: item.followUpPeriodDays,
          imageUrl: item.imageUrl, // 📸 Mapeo de imagen
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
          price: item.price,
          serviceIds: item.packageContents ? item.packageContents.map(c => c.id) : [],
          imageUrl: item.imageUrl, // 📸 Mapeo de imagen
          isNew: false,
          hasUnsavedChanges: false
        }));

      setServices(loadedServices);
      setPackages(loadedPackages);
    } catch (error) {
      console.error("Error cargando inventario", error);
      toast.error("Hubo un error al cargar tu catálogo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- GESTIÓN DE SERVICIOS ---
  const saveService = async (service: UI_Service): Promise<UI_Service | null> => {
    const payload: CatalogItemDTO = {
      type: 'SERVICE',
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.duration,
      modality: mapDeliveryToModality(service.serviceDeliveryType),
      cancellationPolicy: service.cancellationPolicy,
      followUpPeriodDays: service.followUpPeriodDays,
      imageUrl: service.imageUrl // 📸 Incluir en el envío
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
      toast.error(error.response?.data?.message || "Error al guardar el servicio.");
      return null;
    }
  };

  const deleteService = async (id: number): Promise<boolean> => {
    try {
      await catalogService.deleteItem(id);
      return true;
    } catch (error) {
      toast.error("Error al eliminar el servicio.");
      return false;
    }
  };

  // --- GESTIÓN DE PAQUETES ---
  const savePackage = async (pkg: UI_Package): Promise<UI_Package | null> => {
    const payload: CatalogItemDTO = {
      type: 'PACKAGE',
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      packageItemIds: pkg.serviceIds,
      imageUrl: pkg.imageUrl // 📸 Incluir en el envío
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
      toast.error(error.response?.data?.message || "Error al guardar el paquete.");
      return null;
    }
  };

  const deletePackage = async (id: number): Promise<boolean> => {
    try {
      await catalogService.deleteItem(id);
      return true;
    } catch (error) {
      toast.error("Error al eliminar el paquete.");
      return false;
    }
  };

  // 📸 --- SUBIDA A GCP ---
  const uploadItemImage = async (file: File): Promise<string | null> => {
    try {
      // Reutiliza la función de storeService con el enum correcto
      const response = await storeService.uploadMedia(file, 'ITEM_IMAGE' as any);
      return response.url;
    } catch (error) {
      console.error("Error en uploadItemImage", error);
      toast.error("Error al subir la imagen.");
      return null;
    }
  };

  return {
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
    uploadItemImage // 📸 Expuesto hacia la página
  };
};