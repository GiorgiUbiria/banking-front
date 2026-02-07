import { api } from "@/lib/api-client"
import type {
  ExchangeRequest,
  ExchangeResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  ReconcileResponse,
  TransferRequest,
  TransferResponse,
} from "@/types/api"
import { normalizeAccount, normalizeLedgerEntry, normalizeTransaction } from "./normalizers"
import { queryKeys } from "./query-keys"

export { queryKeys }

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", body)
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me")
  return data
}

export async function getAccounts() {
  const { data } = await api.get<unknown>("/accounts")
  const arr = Array.isArray(data) ? data : []
  return arr.map((item) => normalizeAccount(item as Record<string, unknown>))
}

export async function getReconcile(): Promise<ReconcileResponse> {
  const { data } = await api.get<ReconcileResponse>("/accounts/reconcile")
  return data
}

export async function getAccountBalance(id: number) {
  const { data } = await api.get<Record<string, unknown>>(`/accounts/${id}/balance`)
  return {
    id: Number(data?.ID ?? data?.id ?? id),
    currency: String(data?.Currency ?? data?.currency ?? ""),
    balance: Number(data?.Balance ?? data?.balance ?? 0),
  }
}

export async function getTransactions(params?: {
  type?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get<{ transactions?: unknown[] } | unknown[]>(
    "/transactions",
    { params }
  )
  const arr =
    data &&
    typeof data === "object" &&
    "transactions" in data &&
    Array.isArray(data.transactions)
      ? data.transactions
      : Array.isArray(data)
        ? data
        : []
  return arr.map((item) =>
    normalizeTransaction(item as Record<string, unknown>)
  )
}

export async function getLedger(params?: {
  tx_id?: number
  account_id?: number
  page?: number
  limit?: number
}) {
  const { data } = await api.get<unknown>("/ledger", { params })
  const arr = Array.isArray(data) ? data : []
  return arr.map((item) =>
    normalizeLedgerEntry(item as Record<string, unknown>)
  )
}

export async function transfer(body: TransferRequest): Promise<TransferResponse> {
  const { data } = await api.post<TransferResponse>("/transactions/transfer", body)
  return data
}

export async function exchange(body: ExchangeRequest): Promise<ExchangeResponse> {
  const { data } = await api.post<ExchangeResponse>("/transactions/exchange", body)
  return data
}
