import create from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductFormState {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  specs: Record<string, string>;
  hasHydrated: boolean;

  setName: (val: string) => void;
  setDescription: (val: string) => void;
  setPrice: (val: number) => void;
  setImageUrl: (val: string) => void;
  setStock: (val: number) => void;
  setCategoryId: (val: string) => void;

  setSpecs: (specs: Record<string, string>) => void;
  addSpec: (key: string, value: string) => void;
  editSpec: (key: string, value: string) => void;
  removeSpec: (key: string) => void;

  clearForm: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useProductFormStore = create<ProductFormState>()(
  persist(
    (set) => ({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      stock: 0,
      categoryId: '',
      specs: {},
      hasHydrated: false,

      setName: (val) => set({ name: val }),
      setDescription: (val) => set({ description: val }),
      setPrice: (val) => set({ price: val }),
      setImageUrl: (val) => set({ imageUrl: val }),
      setStock: (val) => set({ stock: val }),
      setCategoryId: (val) => set({ categoryId: val }),

      setSpecs: (specs) => set({ specs }),
      addSpec: (key, value) =>
        set((state) => ({
          specs: { ...state.specs, [key]: value },
        })),
      editSpec: (key, value) =>
        set((state) => ({
          specs: { ...state.specs, [key]: value },
        })),
      removeSpec: (key) =>
        set((state) => {
          const newSpecs = { ...state.specs };
          delete newSpecs[key];
          return { specs: newSpecs };
        }),

      clearForm: () =>
        set({
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          stock: 0,
          categoryId: '',
          specs: {},
        }),

      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: 'product-form-storage',
      partialize: (state) => ({
        name: state.name,
        description: state.description,
        price: state.price,
        imageUrl: state.imageUrl,
        stock: state.stock,
        categoryId: state.categoryId,
        specs: state.specs, // 💾 обязательно сохраняем specs
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
