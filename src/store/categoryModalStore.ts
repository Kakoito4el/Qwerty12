import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CategoryModalState = {
  name: string;
  description: string;
  imageUrl: string;
  setField: (field: 'name' | 'description' | 'imageUrl', value: string) => void;
  reset: () => void;
};

export const useCategoryModalStore = create(
  persist<CategoryModalState>(
    (set) => ({
      name: '',
      description: '',
      imageUrl: '',
      setField: (field, value) => set((state) => ({ ...state, [field]: value })),
      reset: () => set({ name: '', description: '', imageUrl: '' }),
    }),
    {
      name: 'category-modal-store', // ключ в localStorage
    }
  )
);
