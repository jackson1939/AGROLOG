import { create } from 'zustand';
import type { Visita } from '@/types';

interface VisitaStore {
  visitas: Visita[];
  setVisitas: (visitas: Visita[]) => void;
  addVisita: (visita: Visita) => void;
}

export const useVisitaStore = create<VisitaStore>((set) => ({
  visitas: [],
  setVisitas: (visitas) => set({ visitas }),
  addVisita: (visita) =>
    set((state) => ({ visitas: [visita, ...state.visitas] })),
}));
