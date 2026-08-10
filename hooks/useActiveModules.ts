"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/stores/SessionStore";
import { useModuleStore } from "@/stores/useModuleStore";
import { activeModulesService } from "@/services/active-modules.service";

/**
 * Hook que carga los módulos activos del paciente basado en sus diagnósticos CIE-10.
 * Se debe colocar en el layout del paciente para que cargue una sola vez.
 *
 * Uso:
 *   useActiveModules(); // en el layout
 *
 * Consultar estado:
 *   const { isModuleActive } = useModuleStore();
 *   isModuleActive("oncology") // → true | false
 */
export function useActiveModules() {
  const { user } = useSessionStore();
  const { setModules, isLoaded, reset } = useModuleStore();

  useEffect(() => {
    if (!user?.id || isLoaded) return;

    activeModulesService
      .getActiveModules(user.id)
      .then((data) => {
        setModules(data.activeModules, data.selfReported);
      })
      .catch((err) => {
        console.warn("[useActiveModules] Could not fetch active modules:", err);
        // On error, load no extra modules — safe default
        setModules([], false);
      });
  }, [user?.id, isLoaded, setModules]);

  // Reset when user logs out
  useEffect(() => {
    if (!user) {
      reset();
    }
  }, [user, reset]);
}
