import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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

const PAGE_SIZE = 10
const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "transfer", label: "Transfer" },
  { value: "exchange", label: "Exchange" },
] as const

export function TransactionsPage() {
  const { data: transactionsData, isLoading } = useTransactions()
  const transactions = Array.isArray(transactionsData) ? transactionsData : []

  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (typeFilter === "all" || !typeFilter) return transactions
    return transactions.filter((tx) => tx.type === typeFilter)
  }, [transactions, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Transaction history</h1>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              {transactions.length === 0
                ? "No transactions yet."
                : "No transactions match the selected filter."}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Currency</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((tx, i) => (
                      <tr key={tx.id ?? `tx-${i}`} className="border-b last:border-0">
                        <td className="p-3">
                          <Badge variant="outline">{tx.type}</Badge>
                        </td>
                        <td className="p-3">
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
                        <td className="p-3">{tx.currency}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Page {currentPage} of {totalPages} ({filtered.length} transaction{filtered.length === 1 ? "" : "s"})
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
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
