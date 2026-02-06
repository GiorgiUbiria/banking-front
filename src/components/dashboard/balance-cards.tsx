import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { Account } from "@/types/api"

interface BalanceCardsProps {
  accounts: Account[]
  isLoading: boolean
}

export function BalanceCards({ accounts, isLoading }: BalanceCardsProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 max-w-md">
      {accounts.map((acc, i) => (
        <Card key={acc.id ?? `account-${i}`} size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{acc.currency}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatCurrency(acc.balance, acc.currency)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
