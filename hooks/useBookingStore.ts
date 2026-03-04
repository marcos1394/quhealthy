// store/useBookingStore.ts
import { create } from 'zustand';
import { StorefrontItem } from '@/types/storefront';

interface BookingState {
  // Datos del Doctor (Para mantener el diseño y consultar la API)
  providerId: number | null;     // 🚀 NUEVO: Necesario para el endpoint de Java
  providerSlug: string | null;   // Necesario para la URL
  providerName: string | null;   // Necesario para el UI
  providerColor: string | null;  // Necesario para el tema (Dark/Neon)

  // El carrito de compras
  cart: StorefrontItem[];

  // Para el paciente (Titular o Familiar)
  dependentId: number | null;


  // Acciones
  // 🚀 ACTUALIZADO: Ahora recibe el ID numérico
  setProvider: (id: number, slug: string, name: string, color: string) => void;
  addToCart: (item: StorefrontItem, currentSlug: string) => void;
  removeFromCart: (itemId: number) => void;
  setDependentId: (id: number | null) => void;
  clearCart: () => void;

  // Selectores derivados
  getTotalPrice: () => number;
  getTotalDuration: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  providerId: null,
  providerSlug: null,
  providerName: null,
  providerColor: null,
  cart: [],
  dependentId: null,

  // 🚀 ACTUALIZADO: Guardamos el ID en el estado global
  setProvider: (id, slug, name, color) =>
    set({
      providerId: id,
      providerSlug: slug,
      providerName: name,
      providerColor: color
    }),

  addToCart: (item, currentSlug) => {
    const { providerSlug, clearCart } = get();

    // Si el paciente cambia de doctor (cambia el slug), limpiamos el carrito anterior por seguridad
    if (providerSlug && providerSlug !== currentSlug) {
      clearCart();
    }

    set((state) => {
      // Evitamos duplicados en el carrito (buena UX para servicios médicos)
      const exists = state.cart.some((cartItem) => cartItem.id === item.id);
      if (exists) return state;

      return { cart: [...state.cart, item], providerSlug: currentSlug };
    });
  },

  removeFromCart: (itemId) =>
    set((state) => ({ cart: state.cart.filter((i) => i.id !== itemId) })),

  setDependentId: (id) => set({ dependentId: id }),

  // 🚀 ACTUALIZADO: Limpiamos también el providerId
  clearCart: () =>
    set({
      cart: [],
      providerId: null,
      providerSlug: null,
      providerName: null,
      providerColor: null,
      dependentId: null
    }),

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price, 0);
  },

  getTotalDuration: () => {
    return get().cart.reduce((total, item) => total + (item.durationMinutes || 0), 0);
  }
}));