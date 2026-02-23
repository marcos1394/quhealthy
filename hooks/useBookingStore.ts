// store/useBookingStore.ts
import { create } from 'zustand';
import { StorefrontItem } from '@/types/storefront';

interface BookingState {
  // Datos del Doctor (Para mantener el diseño en el checkout)
  providerSlug: string | null;
  providerName: string | null;
  providerColor: string | null;
  
  // El carrito de compras
  cart: StorefrontItem[];
  
  // Acciones
  setProvider: (slug: string, name: string, color: string) => void;
  addToCart: (item: StorefrontItem, currentSlug: string) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  
  // Selectores derivados
  getTotalPrice: () => number;
  getTotalDuration: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  providerSlug: null,
  providerName: null,
  providerColor: null,
  cart: [],

  setProvider: (slug, name, color) => 
    set({ providerSlug: slug, providerName: name, providerColor: color }),

  addToCart: (item, currentSlug) => {
    const { providerSlug, clearCart } = get();
    
    // Si el paciente cambia de doctor, limpiamos el carrito anterior por seguridad
    if (providerSlug && providerSlug !== currentSlug) {
      clearCart();
    }
    
    set((state) => {
      // Evitamos duplicados en el carrito (opcional, pero buena UX para servicios médicos)
      const exists = state.cart.some((cartItem) => cartItem.id === item.id);
      if (exists) return state;

      return { cart: [...state.cart, item], providerSlug: currentSlug };
    });
  },

  removeFromCart: (itemId) => 
    set((state) => ({ cart: state.cart.filter((i) => i.id !== itemId) })),

  clearCart: () => 
    set({ cart: [], providerSlug: null, providerName: null, providerColor: null }),

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price, 0);
  },
  
  getTotalDuration: () => {
    return get().cart.reduce((total, item) => total + (item.durationMinutes || 0), 0);
  }
}));