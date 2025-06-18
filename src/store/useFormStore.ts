// src/store/useFormStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductFormState {
  formData: {
    name: string;
    description: string;
    image_url: string;
    price: string;
    category_id: string;
  };
  setFormData: (data: Partial<ProductFormState['formData']>) => void;
  clearFormData: () => void;
}

export const useFormStore = create<ProductFormState>()(
  persist(
    (set) => ({
      formData: {
        name: '',
        description: '',
        image_url: '',
        price: '',
        category_id: '',
      },
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      clearFormData: () =>
        set({
          formData: {
            name: '',
            description: '',
            image_url: '',
            price: '',
            category_id: '',
          },
        }),
    }),
    {
      name: 'admin:formData', // localStorage key
    }
  )
);
