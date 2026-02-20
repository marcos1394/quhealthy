// hooks/useCatalog.ts
import { useState, useCallback } from 'react';
import { catalogService } from '@/services/catalog.service';
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
          // Extraemos los IDs de los servicios incluidos a partir del 'packageContents' del response
          serviceIds: item.packageContents ? item.packageContents.map(c => c.id) : [],
          isNew: false
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
      followUpPeriodDays: service.followUpPeriodDays
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
      packageItemIds: pkg.serviceIds // 🚀 ¡Magia del backend!
    };

    try {
      let savedItem: CatalogItemDTO;
      if (pkg.isNew) {
        savedItem = await catalogService.createItem(payload);
      } else {
        savedItem = await catalogService.updateItem(pkg.id, payload);
      }
      return { ...pkg, id: savedItem.id!, isNew: false };
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

  return {
    services,
    setServices, // Expuesto para manejo local inmediato (drag&drop, typing)
    packages,
    setPackages,
    isLoading,
    fetchInventory,
    saveService,
    deleteService,
    savePackage,
    deletePackage
  };
};