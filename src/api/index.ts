import { api } from "@/lib/api-client";
import type {
  Account,
  ExchangeRequest,
  ExchangeResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  TransferRequest,
  TransferResponse,
  Transaction,
} from "@/types/api";

export const queryKeys = {
  me: ["auth", "me"] as const,
  accounts: ["accounts"] as const,
  accountBalance: (id: number) => ["accounts", id, "balance"] as const,
  transactions: ["transactions"] as const,
  transactionsFiltered: (type?: string, page?: number, limit?: number) =>
    ["transactions", { type, page, limit }] as const,
};

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  return data;
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export async function getAccounts(): Promise<Account[]> {
  const { data } = await api.get<Account[]>("/accounts");
  return data;
}

export async function getAccountBalance(
  id: number,
): Promise<{ id: number; currency: string; balance: number }> {
  const { data } = await api.get(`/accounts/${id}/balance`);
  return data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>("/transactions");
  return data;
}

export async function transfer(
  body: TransferRequest,
): Promise<TransferResponse> {
  const { data } = await api.post<TransferResponse>(
    "/transactions/transfer",
    body,
  );
  return data;
}

export async function exchange(
  body: ExchangeRequest,
): Promise<ExchangeResponse> {
  const { data } = await api.post<ExchangeResponse>(
    "/transactions/exchange",
    body,
  );
  return data;
}
