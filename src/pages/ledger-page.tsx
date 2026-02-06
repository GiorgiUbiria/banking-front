import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Ledger</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Double-entry audit trail for your accounts. Entries are created when you transfer or exchange.
            </p>
          </div>
          <div className="flex items-center gap-2">
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
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No ledger entries yet. Transfer or exchange to see entries.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Account ID</th>
                      <th className="p-3 font-medium">Tx ID</th>
                      <th className="p-3 font-medium">Amount</th>
                      <th className="p-3 font-medium">Currency</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr key={entry.id ?? `ledger-${i}`} className="border-b last:border-0">
                        <td className="p-3">{entry.accountID}</td>
                        <td className="p-3">{entry.txID}</td>
                        <td className="p-3 font-mono">
                          {entry.amount >= 0 ? "+" : ""}
                          {formatCurrency(entry.amount, entry.currency)}
                        </td>
                        <td className="p-3">{entry.currency}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {showPagination && (
              <div className="flex items-center justify-between gap-4">
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
