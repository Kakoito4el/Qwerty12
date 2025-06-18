import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types/supabase';

interface CartState {
  items: CartItem[];
  addItem: (product: Product | CartItem, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

addItem: (product, quantity = 1) =>
  set((state) => {
    const isBuild = 'isBuild' in product && product.isBuild === true;
const itemId = product.id; // всегда использовать поле `id` как уникальный идентификатор

if (!itemId || !product.name || !product.price || !product.image_url) {
  console.warn('❌ Невалидный товар, не добавляем в корзину:', {
    id: itemId,
    name: product.name,
    price: product.price,
    image_url: product.image_url,
    isBuild,
    product
  });
  return state;
}

    const existingItem = state.items.find(
      (item) => item.id === itemId && item.isBuild === isBuild
    );

    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === itemId && item.isBuild === isBuild
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      };
    }

const newItem: CartItem = {
  id: itemId,
  name: product.name,
  price: product.price,
  image_url: product.image_url,
  quantity,
  isBuild,
  buildId: isBuild ? itemId : undefined,
  components: isBuild && 'components' in product ? product.components : undefined,
};

    return {
      items: [...state.items, newItem],
    };
  }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        ),
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
