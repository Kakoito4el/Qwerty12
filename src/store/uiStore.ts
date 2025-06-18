// src/store/uiStore.ts

import create from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  /**
   * Пример 1. Поисковая строка на странице управления товарами.
   * Если вы хотите, чтобы введённый текст в поиск
   * не терялся при перезагрузке, храните здесь.
   */
  adminSearchQuery: string;
  setAdminSearchQuery: (val: string) => void;

  /**
   * Пример 2. Фильтр по категории (например, на странице товаров).
   * Если пользователь выбрал категорию, и ушёл со страницы, потом вернулся —
   * фильтр подтянется из localStorage.
   */
  productsFilterCategory: string;
  setProductsFilterCategory: (val: string) => void;

  /**
   * Пример 3. Состояние сортировки товаров (имя поля и направление).
   * Если используется локальная сортировка (не серверная):
   *   sortField: 'name' | 'price' | 'stock' | …
   *   sortDirection: 'asc' | 'desc'
   */
  productsSortField: string;
  setProductsSortField: (field: string) => void;

  productsSortDirection: 'asc' | 'desc';
  setProductsSortDirection: (dir: 'asc' | 'desc') => void;

  /**
   * Пример 4. Черновик (draft) при редактировании какого-либо большого текста,
   * например, описания товара, контента страницы и т.п.
   * В зависимости от приложения таких draft-полей может быть несколько,
   * но покажем один универсальный пример:
   */
  draftText: string;
  setDraftText: (val: string) => void;
  clearDraftText: () => void;

  /**
   * Пример 5. Перезагруженная форма создания товара (если вы хотите,
   * чтобы пока не нажали "Создать", все данные сохранялись):
   */
  newProductForm: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    categoryId: string;
    specs: Record<string, string>;
  };
  setNewProductForm: (partial: Partial<UIState['newProductForm']>) => void;
  clearNewProductForm: () => void;
}

/**
 * Хранилище uiStore: все UI-состояния, которые мы хотим сохранять
 * между перезагрузками. Благодаря middleware.persist всё это
 * автоматически сохраняется в localStorage (ключ — "ui-store").
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // ====== Инициализация состояний ======
      adminSearchQuery: '',
      setAdminSearchQuery: (val: string) => set({ adminSearchQuery: val }),

      productsFilterCategory: '',
      setProductsFilterCategory: (val: string) => set({ productsFilterCategory: val }),

      productsSortField: 'name',
      setProductsSortField: (field: string) => set({ productsSortField: field }),

      productsSortDirection: 'asc',
      setProductsSortDirection: (dir: 'asc' | 'desc') => set({ productsSortDirection: dir }),

      draftText: '',
      setDraftText: (val: string) => set({ draftText: val }),
      clearDraftText: () => set({ draftText: '' }),

      newProductForm: {
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        stock: 0,
        categoryId: '',
        specs: {},
      },
      setNewProductForm: (partial) =>
        set((state) => ({
          newProductForm: {
            ...state.newProductForm,
            ...partial,
          },
        })),
      clearNewProductForm: () =>
        set({
          newProductForm: {
            name: '',
            description: '',
            price: 0,
            imageUrl: '',
            stock: 0,
            categoryId: '',
            specs: {},
          },
        }),
    }),
    {
      name: 'ui-store', // Ключ для localStorage: "ui-store"
      getStorage: () => localStorage, // веб-хранилище
    }
  )
);
