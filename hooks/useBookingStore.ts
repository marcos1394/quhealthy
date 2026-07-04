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
  updateQuantity: (itemId: number, qty: number) => void;
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

  // 🚀 ACTUALIZADO: Guardamos el ID en el estado global y limpiamos el carrito si cambia
  setProvider: (id, slug, name, color) =>
    set((state) => {
      // Si el paciente cambia de doctor, limpiamos el carrito anterior por seguridad
      if (state.providerId !== null && state.providerId !== id) {
        return {
          cart: [],
          dependentId: null,
          providerId: id,
          providerSlug: slug,
          providerName: name,
          providerColor: color
        };
      }
      return {
        providerId: id,
        providerSlug: slug,
        providerName: name,
        providerColor: color
      };
    }),

  addToCart: (item, currentSlug) => {
    const { providerSlug, clearCart } = get();

    // Si el paciente cambia de doctor (cambia el slug), limpiamos el carrito anterior por seguridad
    if (providerSlug && providerSlug !== currentSlug) {
      clearCart();
    }

    set((state) => {
      const exists = state.cart.find((cartItem) => cartItem.id === item.id);
      if (exists) {
        // Solo para productos físicos/digitales permitimos tener más de 1 unidad
        if (exists.type === 'PRODUCT') {
          return {
            cart: state.cart.map(c => 
              c.id === item.id ? { ...c, cartQuantity: (c.cartQuantity || 1) + 1 } : c
            ),
            providerSlug: currentSlug
          };
        }
        return state;
      }

      // Al agregarlo nuevo, le asignamos cantidad 1
      const newItem = { ...item, cartQuantity: 1 };
      return { cart: [...state.cart, newItem], providerSlug: currentSlug };
    });
  },

  updateQuantity: (itemId, qty) =>
    set((state) => ({
      cart: state.cart.map(item => 
        item.id === itemId && item.type === 'PRODUCT' ? { ...item, cartQuantity: Math.max(1, qty) } : item
      )
    })),

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
    return get().cart.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
  },

  getTotalDuration: () => {
    return get().cart.reduce((total, item) => total + (item.durationMinutes || 0), 0);
  }
}));