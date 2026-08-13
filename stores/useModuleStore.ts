import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModuleStore {
  activeModules: string[];
  selfReported: boolean;
  isLoaded: boolean;
  setModules: (modules: string[], selfReported: boolean) => void;
  isModuleActive: (key: string) => boolean;
  reset: () => void;
}

export const useModuleStore = create<ModuleStore>()(
  persist(
    (set, get) => ({
      activeModules: [],
      selfReported: false,
      isLoaded: false,

      setModules: (modules, selfReported) =>
        set({ activeModules: modules, selfReported, isLoaded: true }),

      isModuleActive: (key) => get().activeModules.includes(key),

      reset: () => set({ activeModules: [], selfReported: false, isLoaded: false }),
    }),
    {
      name: 'qu-module-store',
    }
  )
);
