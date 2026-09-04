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

export interface ProviderGroup {
  providerId?: number;
  providerName: string;
  providerSlug?: string;
  providerColor?: string;
  items: CartItem[];
  subtotal: number;
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
  
  setProvider: (id: number, slug: string, name: string, color: string) => void;
  addToCart: (item: StorefrontItem, currentSlug: string, providerName?: string, providerColor?: string) => void;
  updateQuantity: (itemId: number, qty: number) => void;
  removeFromCart: (itemId: number) => void;
  setDependentId: (id: number | null) => void;
  clearCart: () => void;

  // Selectores y Helpers derivados
  getTotalPrice: () => number;
  getTotalDuration: () => number;
  getTotalItemCount: () => number;
  hasServices: () => boolean;
  hasProducts: () => boolean;
  hasCourses: () => boolean;
  getProviderGroups: () => ProviderGroup[];
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

      setProvider: (_id, _slug, _name, _color) => {
        // Multi-proveedor: no se borra el carrito
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
            providerName: providerName || "Proveedor QuHealthy",
            providerColor: providerColor || "#059669",
            providerId: (item as any).providerId || undefined,
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
        set((state) => {
          const nextCart = state.cart.filter((i) => i.id !== itemId);
          return {
            cart: nextCart,
            isCartOpen: nextCart.length === 0 ? false : state.isCartOpen,
          };
        }),

      setDependentId: (id) => set({ dependentId: id }),

      clearCart: () =>
        set({
          cart: [],
          dependentId: null,
          isCartOpen: false,
        }),

      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
      },

      getTotalDuration: () => {
        return get().cart.reduce((total, item) => total + (item.durationMinutes || 0), 0);
      },

      getTotalItemCount: () => {
        return get().cart.reduce((count, item) => count + (item.cartQuantity || 1), 0);
      },

      hasServices: () => {
        return get().cart.some((item) => item.type === 'SERVICE' || item.type === 'PACKAGE');
      },

      hasProducts: () => {
        return get().cart.some((item) => item.type === 'PRODUCT');
      },

      hasCourses: () => {
        return get().cart.some((item) => item.type === 'COURSE');
      },

      getProviderGroups: () => {
        const cart = get().cart;
        const groupsMap = new Map<string, ProviderGroup>();

        for (const item of cart) {
          const key = item.providerSlug || String(item.providerId || 'general');
          const existing = groupsMap.get(key);
          const itemSubtotal = item.price * (item.cartQuantity || 1);

          if (existing) {
            existing.items.push(item);
            existing.subtotal += itemSubtotal;
          } else {
            groupsMap.set(key, {
              providerId: item.providerId,
              providerName: item.providerName || 'Proveedor',
              providerSlug: item.providerSlug,
              providerColor: item.providerColor,
              items: [item],
              subtotal: itemSubtotal,
            });
          }
        }

        return Array.from(groupsMap.values());
      },
    }),
    {
      name: 'quhealthy-cart-storage',
      partialize: (state) => ({ cart: state.cart, dependentId: state.dependentId }),
    }
  )
);