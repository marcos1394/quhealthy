import { create } from 'zustand';

export interface BIFilters {
  estado?: string;
  municipio?: string;
  institucion?: string;
  nivel?: string;
  tipo?: string;
}

interface BIState {
  filters: BIFilters;
  groupBy: string;
  setFilter: (key: keyof BIFilters, value: string | undefined) => void;
  setFilters: (filters: BIFilters) => void;
  setGroupBy: (groupBy: string) => void;
  clearFilters: () => void;
}

export const useBIStore = create<BIState>((set) => ({
  filters: {},
  groupBy: 'entidad',
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (filters) => set({ filters }),
  setGroupBy: (groupBy) => set({ groupBy }),
  clearFilters: () => set({ filters: {} }),
}));
