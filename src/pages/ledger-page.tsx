import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { useLedger } from "@/hooks/use-ledger"
import { formatCurrency, formatDate } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const LIMIT_OPTIONS = [10, 20, 50, 100] as const

export function LedgerPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data: entriesData, isLoading } = useLedger({ page, limit })
  const entries = Array.isArray(entriesData) ? entriesData : []

  const hasMore = entries.length >= limit
  const showPagination = page > 1 || hasMore

  return (
    <DashboardLayout>
      <div className="page-container space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Ledger</h1>
            <p className="page-description">
              Double-entry audit trail for your accounts. Entries are created when you transfer or exchange.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="ledger-limit" className="text-sm text-muted-foreground whitespace-nowrap">
              Per page
            </Label>
            <Select
              value={String(limit)}
              onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}
            >
              <SelectTrigger id="ledger-limit" className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : entries.length === 0 ? (
          <Card className="shadow-(--shadow-card)">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No ledger entries yet. Transfer or exchange to see entries.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-(--shadow-card) border-border/80 overflow-hidden">
              <CardContent className="p-0">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account ID</th>
                      <th>Tx ID</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr key={entry.id ?? `ledger-${i}`}>
                        <td>{entry.accountID}</td>
                        <td>{entry.txID}</td>
                        <td className="font-mono tabular-nums">
                          {entry.amount >= 0 ? "+" : ""}
                          {formatCurrency(entry.amount, entry.currency)}
                        </td>
                        <td>{entry.currency}</td>
                        <td className="text-muted-foreground">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {showPagination && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-muted-foreground text-sm">Page {page}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
