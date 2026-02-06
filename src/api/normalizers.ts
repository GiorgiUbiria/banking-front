import type { Account, LedgerEntry, Transaction } from "@/types/api"

export function normalizeAccount(raw: Record<string, unknown>): Account {
  return {
    id: Number(raw.ID ?? raw.id),
    userID: Number(raw.UserID ?? raw.userID),
    currency: String(raw.Currency ?? raw.currency ?? ""),
    balance: Number(raw.Balance ?? raw.balance ?? 0),
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    updatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
  }
}

export function normalizeTransaction(raw: Record<string, unknown>): Transaction {
  return {
    id: Number(raw.ID ?? raw.id),
    userID: Number(raw.UserID ?? raw.userID),
    type: String(raw.Type ?? raw.type ?? ""),
    status: String(raw.Status ?? raw.status ?? ""),
    currency: String(raw.Currency ?? raw.currency ?? ""),
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    updatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
  }
}

export function normalizeLedgerEntry(raw: Record<string, unknown>): LedgerEntry {
  return {
    id: Number(raw.ID ?? raw.id),
    accountID: Number(raw.AccountID ?? raw.accountID ?? 0),
    txID: Number(raw.TxID ?? raw.txID ?? 0),
    amount: Number(raw.Amount ?? raw.amount ?? 0),
    currency: String(raw.Currency ?? raw.currency ?? ""),
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    updatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
  }
}
