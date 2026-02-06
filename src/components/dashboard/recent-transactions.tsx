import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import type { Transaction } from "@/types/api"

interface RecentTransactionsProps {
  transactions: Transaction[]
  isLoading: boolean
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5)
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>
  }
  if (recent.length === 0) {
    return <p className="text-muted-foreground text-sm">No transactions yet.</p>
  }
  return (
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
            {recent.map((tx, i) => (
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
  )
}
