import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/supabase';

// Component categories for PC building
export type ComponentType = 'cpu' | 'motherboard' | 'gpu' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling';

type PCBuild = {
  [key in ComponentType]?: Product;
};

interface PCBuilderState {
  build: PCBuild;
  addComponent: (type: ComponentType, product: Product) => void;
  removeComponent: (type: ComponentType) => void;
  clearBuild: () => void;
  getBuildTotal: () => number;
  getComponentsCount: () => number;
}

export const usePCBuilderStore = create<PCBuilderState>()(
  persist(
    (set, get) => ({
      build: {},
      
      addComponent: (type, product) => set((state) => ({
        build: {
          ...state.build,
          [type]: product
        }
      })),
      
      removeComponent: (type) => set((state) => {
        const newBuild = { ...state.build };
        delete newBuild[type];
        return { build: newBuild };
      }),
      
      clearBuild: () => set({ build: {} }),
      
      getBuildTotal: () => {
        const build = get().build;
        return Object.values(build).reduce(
          (total, product) => total + (product?.price || 0), 
          0
        );
      },
      
      getComponentsCount: () => {
        return Object.keys(get().build).length;
      }
    }),
    {
      name: 'pc-builder-storage',
    }
  )
);