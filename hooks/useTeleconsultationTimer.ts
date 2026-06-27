import { useEffect } from 'react';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';

export const useTeleconsultationTimer = () => {
  const { serverEndTime, remainingSeconds, updateRemainingSeconds, setState, state } = useTeleconsultationStore();

  useEffect(() => {
    if (!serverEndTime || state === 'COMPLETED' || state === 'FAILED' || state === 'IDLE') {
      return;
    }

    const interval = setInterval(() => {
      const end = new Date(serverEndTime).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((end - now) / 1000);

      if (diff <= 0) {
        clearInterval(interval);
        updateRemainingSeconds(0);
        // El backend se encarga de cambiar el estado, pero como respaldo local:
        if (state === 'IN_PROGRESS' || state === 'CONNECTED') {
          // No forzamos COMPLETED directamente aquí para dejar que el backend mande FINISHED
          // pero podríamos hacerlo.
        }
      } else {
        updateRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverEndTime, state, updateRemainingSeconds]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = remainingSeconds !== null && remainingSeconds <= 300 && remainingSeconds > 60; // 5 minutos
  const isCritical = remainingSeconds !== null && remainingSeconds <= 60; // 1 minuto

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isWarning,
    isCritical
  };
};
