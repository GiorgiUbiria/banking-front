import { api } from "@/lib/api-client";
import type {
  Account,
  ExchangeRequest,
  ExchangeResponse,
  LedgerEntry,
  LoginRequest,
  LoginResponse,
  MeResponse,
  TransferRequest,
  TransferResponse,
  Transaction,
} from "@/types/api";

function normalizeAccount(raw: Record<string, unknown>): Account {
  return {
    id: Number(raw.ID ?? raw.id),
    userID: Number(raw.UserID ?? raw.userID),
    currency: String(raw.Currency ?? raw.currency ?? ""),
    balance: Number(raw.Balance ?? raw.balance ?? 0),
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    updatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
  };
}

function normalizeTransaction(raw: Record<string, unknown>): Transaction {
  return {
    id: Number(raw.ID ?? raw.id),
    userID: Number(raw.UserID ?? raw.userID),
    type: String(raw.Type ?? raw.type ?? ""),
    status: String(raw.Status ?? raw.status ?? ""),
    currency: String(raw.Currency ?? raw.currency ?? ""),
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    updatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
  };
}

function normalizeLedgerEntry(raw: Record<string, unknown>): LedgerEntry {
  return {
    id: Number(raw.ID ?? raw.id),
    accountID: Number(raw.AccountID ?? raw.accountID ?? 0),
    txID: Number(raw.TxID ?? raw.txID ?? 0),
    amount: Number(raw.Amount ?? raw.amount ?? 0),
    currency: String(raw.Currency ?? raw.currency ?? ""),
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    updatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
  };
}

export const queryKeys = {
  me: ["auth", "me"] as const,
  accounts: ["accounts"] as const,
  accountBalance: (id: number) => ["accounts", id, "balance"] as const,
  transactions: ["transactions"] as const,
  transactionsFiltered: (type?: string, page?: number, limit?: number) =>
    ["transactions", { type, page, limit }] as const,
  ledger: (params?: { tx_id?: number; account_id?: number; page?: number; limit?: number }) =>
    ["ledger", params] as const,
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
  const { data } = await api.get<unknown>("/accounts");
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item) => normalizeAccount(item as Record<string, unknown>));
}

export async function getAccountBalance(
  id: number,
): Promise<{ id: number; currency: string; balance: number }> {
  const { data } = await api.get<Record<string, unknown>>(
    `/accounts/${id}/balance`,
  );
  return {
    id: Number(data?.ID ?? data?.id ?? id),
    currency: String(data?.Currency ?? data?.currency ?? ""),
    balance: Number(data?.Balance ?? data?.balance ?? 0),
  };
}

export async function getTransactions(params?: {
  type?: string;
  page?: number;
  limit?: number;
}): Promise<Transaction[]> {
  const { data } = await api.get<{ transactions?: unknown[] } | unknown[]>(
    "/transactions",
    { params },
  );
  const arr =
    data &&
    typeof data === "object" &&
    "transactions" in data &&
    Array.isArray(data.transactions)
      ? data.transactions
      : Array.isArray(data)
        ? data
        : [];
  return arr.map((item) =>
    normalizeTransaction(item as Record<string, unknown>),
  );
}

export async function getLedger(params?: {
  tx_id?: number;
  account_id?: number;
  page?: number;
  limit?: number;
}): Promise<LedgerEntry[]> {
  const { data } = await api.get<unknown>("/ledger", { params });
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item) =>
    normalizeLedgerEntry(item as Record<string, unknown>),
  );
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
