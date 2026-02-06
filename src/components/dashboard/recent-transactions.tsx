import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((tx, i) => (
              <TableRow key={tx.id ?? `tx-${i}`}>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>{tx.currency}</TableCell>
                <TableCell className="muted">{formatDate(tx.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
