"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthInitializer() {
  useEffect(() => {
    // Sync token from zustand to localStorage on app load
    const { token, setToken } = useAuthStore.getState();
    
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      
      // If zustand has token but localStorage doesn't, sync it
      if (token && !storedToken) {
        localStorage.setItem('auth_token', token);
      }
      // If localStorage has token but zustand doesn't, sync it
      else if (!token && storedToken) {
        setToken(storedToken);
      }
      // If both have different tokens, prefer zustand (it's the source of truth)
      else if (token && storedToken && token !== storedToken) {
        localStorage.setItem('auth_token', token);
      }
    }
  }, []);

  return null;
}
