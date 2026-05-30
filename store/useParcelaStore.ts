import { create } from 'zustand';
import type { Parcela } from '@/types';

interface ParcelaStore {
  parcelas: Parcela[];
  setParcelas: (parcelas: Parcela[]) => void;
  addParcela: (parcela: Parcela) => void;
}

export const useParcelaStore = create<ParcelaStore>((set) => ({
  parcelas: [],
  setParcelas: (parcelas) => set({ parcelas }),
  addParcela: (parcela) =>
    set((state) => ({ parcelas: [parcela, ...state.parcelas] })),
}));
