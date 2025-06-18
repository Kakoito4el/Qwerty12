import { create } from 'zustand';
import { Product } from '../types/supabase';

interface ProductStore {
  products: Product[];           // список товаров
  currentProduct: Product | null;
  selectedIds: string[];
  setProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  setSelectedIds: (ids: string[]) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  currentProduct: null,
  selectedIds: JSON.parse(localStorage.getItem('admin:selectedIds') || '[]'),
  
  setProducts: (products) => set({ products }),
  setCurrentProduct: (product) => set({ currentProduct: product }),
  setSelectedIds: (ids) => {
    localStorage.setItem('admin:selectedIds', JSON.stringify(ids));
    set({ selectedIds: ids });
  },
}));
