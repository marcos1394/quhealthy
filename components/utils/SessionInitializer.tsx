"use client";

import { useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { authService } from '@/services/auth.services';

export function SessionInitializer() {
  useEffect(() => {
    const state = useSessionStore.getState();
    if (!state.user && !state.isLoading) {
      // authService.getSession();
    }
  }, []);

  return null;
}