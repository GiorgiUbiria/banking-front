import { create } from "zustand"
import { setAuthToken } from "@/lib/api-client"
import type { MeResponse } from "@/types/api"

interface AuthState {
  token: string | null
  user: MeResponse | null
  setAuth: (token: string, user: MeResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    setAuthToken(token)
    set({ token, user })
  },
  clearAuth: () => {
    setAuthToken(null)
    set({ token: null, user: null })
  },
}))
