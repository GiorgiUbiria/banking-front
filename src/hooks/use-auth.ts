import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { getMe, queryKeys } from "@/api";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: !!token && !user,
  });

  useEffect(() => {
    if (token && query.data) {
      setAuth(token, query.data);
    }
  }, [token, query.data, setAuth]);

  return {
    user: user ?? query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    setAuth,
    clearAuth,
  };
}
