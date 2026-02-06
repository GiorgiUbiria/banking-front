import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { useTransactions } from "@/hooks/use-transactions"
import { formatDate } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const LIMIT_OPTIONS = [10, 20, 50] as const
const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "transfer", label: "Transfer" },
  { value: "exchange", label: "Exchange" },
] as const

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { data: transactionsData, isLoading } = useTransactions({
    type: typeFilter === "all" || !typeFilter ? undefined : typeFilter,
    page,
    limit,
  })
  const transactions = Array.isArray(transactionsData) ? transactionsData : []
  const hasMore = transactions.length >= limit
  const showPagination = page > 1 || hasMore

  return (
    <DashboardLayout>
      <div className="page-container space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="page-title">Transaction history</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Label htmlFor="type-filter" className="text-sm text-muted-foreground whitespace-nowrap">
              Type
            </Label>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger id="type-filter" className="w-[140px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit" className="text-sm text-muted-foreground whitespace-nowrap">
                Per page
              </Label>
              <Select
                value={String(limit)}
                onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}
              >
                <SelectTrigger id="limit" className="w-[80px]">
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
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : transactions.length === 0 ? (
          <Card className="shadow-(--shadow-card)">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No transactions yet.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-(--shadow-card) border-border/80 overflow-hidden">
              <CardContent className="p-0">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Currency</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={tx.id ?? `tx-${i}`}>
                        <td>
                          <Badge variant="outline" className="font-medium">
                            {tx.type}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "default"
                                : tx.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </td>
                        <td>{tx.currency}</td>
                        <td className="text-muted-foreground">{formatDate(tx.createdAt)}</td>
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
