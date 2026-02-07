export const queryKeys = {
  me: ["auth", "me"] as const,
  accounts: ["accounts"] as const,
  accountBalance: (id: number) => ["accounts", id, "balance"] as const,
  reconcile: ["accounts", "reconcile"] as const,
  transactions: ["transactions"] as const,
  transactionsFiltered: (type?: string, page?: number, limit?: number) =>
    ["transactions", { type, page, limit }] as const,
  ledger: (params?: {
    tx_id?: number
    account_id?: number
    page?: number
    limit?: number
  }) => ["ledger", params] as const,
}
