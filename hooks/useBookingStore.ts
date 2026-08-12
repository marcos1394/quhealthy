// store/useBookingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorefrontItem } from '@/types/storefront';

export interface CartItem extends StorefrontItem {
  cartQuantity: number;
  providerSlug?: string;
  providerName?: string;
  providerColor?: string;
  providerId?: number;
}

interface BookingState {
  // El carrito de compras (Multi-proveedor)
  cart: CartItem[];

  // Estado del UI del carrito global
  isCartOpen: boolean;

  // Para el paciente (Titular o Familiar)
  dependentId: number | null;

  // Acciones
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Mantenemos setProvider por compatibilidad, aunque ya no es estricto a un solo proveedor
  setProvider: (id: number, slug: string, name: string, color: string) => void;
  addToCart: (item: StorefrontItem, currentSlug: string, providerName?: string, providerColor?: string) => void;
  updateQuantity: (itemId: number, qty: number) => void;
  removeFromCart: (itemId: number) => void;
  setDependentId: (id: number | null) => void;
  clearCart: () => void;

  // Selectores derivados
  getTotalPrice: () => number;
  getTotalDuration: () => number;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      dependentId: null,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setProvider: (id, slug, name, color) => {
        // Ya no limpiamos el carrito al cambiar de proveedor porque ahora es multi-proveedor
      },

      addToCart: (item, currentSlug, providerName, providerColor) => {
        set((state) => {
          const exists = state.cart.find((cartItem) => cartItem.id === item.id && cartItem.type === item.type);
          if (exists) {
            // Solo para productos físicos/digitales permitimos tener más de 1 unidad
            if (exists.type === 'PRODUCT') {
              return {
                cart: state.cart.map(c => 
                  c.id === item.id && c.type === item.type ? { ...c, cartQuantity: (c.cartQuantity || 1) + 1 } : c
                )
              };
            }
            return state;
          }

          // Al agregarlo nuevo, le asignamos cantidad 1 y guardamos los datos del proveedor
          const newItem: CartItem = { 
            ...item, 
            cartQuantity: 1, 
            providerSlug: currentSlug,
            providerName: providerName || "Proveedor",
            providerColor: providerColor || "#000000"
          };
          return { cart: [...state.cart, newItem] };
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

      clearCart: () =>
        set({
          cart: [],
          dependentId: null
        }),

      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
      },

      getTotalDuration: () => {
        return get().cart.reduce((total, item) => total + (item.durationMinutes || 0), 0);
      }
    }),
    {
      name: 'quhealthy-cart-storage',
      partialize: (state) => ({ cart: state.cart, dependentId: state.dependentId }),
    }
  )
);