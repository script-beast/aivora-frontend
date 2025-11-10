"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth state on mount
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
