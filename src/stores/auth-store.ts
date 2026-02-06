import { create } from "zustand"
import { setAuthToken } from "@/lib/api-client"
import type { MeResponse } from "@/types/api"

const AUTH_STORAGE_KEY = "banking-auth"

function getStoredAuth(): { token: string; user: MeResponse } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { token?: string; user?: MeResponse }
    if (typeof data?.token === "string" && data?.user && typeof data.user.id === "number") {
      return { token: data.token, user: data.user }
    }
    return null
  } catch {
    return null
  }
}

interface AuthState {
  token: string | null
  user: MeResponse | null
  setAuth: (token: string, user: MeResponse) => void
  clearAuth: () => void
}

const stored = getStoredAuth()
if (stored?.token) setAuthToken(stored.token)

export const useAuthStore = create<AuthState>((set) => ({
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  setAuth: (token, user) => {
    setAuthToken(token)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }))
    set({ token, user })
  },
  clearAuth: () => {
    setAuthToken(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    set({ token: null, user: null })
  },
}))
