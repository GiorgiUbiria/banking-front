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
            {recent.map((tx, i) => (
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
  )
}
