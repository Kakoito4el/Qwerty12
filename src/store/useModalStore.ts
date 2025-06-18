import { create } from 'zustand';

interface ModalState {
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isAddModalOpen: false,
  isEditModalOpen: false,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openEditModal: () => set({ isEditModalOpen: true }),
  closeEditModal: () => set({ isEditModalOpen: false }),
}));
