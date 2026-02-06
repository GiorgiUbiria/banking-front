import { useState } from "react"
import { z } from "zod"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import { useTransfer } from "@/hooks/use-transfer"
import { useExchange } from "@/hooks/use-exchange"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Account } from "@/types/api"

const USD_EUR_RATE = 0.92

const transferSchema = z.object({
  from_account_id: z.number({ message: "Select source account" }),
  to_account_id: z.coerce.number().int().positive("Enter a valid recipient account ID"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use up to 2 decimal places")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
})

const exchangeSchema = z.object({
  from_account_id: z.number({ message: "Select source currency" }),
  to_account_id: z.number({ message: "Select target currency" }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use up to 2 decimal places")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
})

export function DashboardPage() {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions()
  const transferMutation = useTransfer()
  const exchangeMutation = useExchange()

  const accounts = Array.isArray(accountsData) ? accountsData : []
  const transactions = Array.isArray(transactionsData) ? transactionsData : []
  const recentTransactions = transactions.slice(0, 5)

  const [transferToId, setTransferToId] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferFromId, setTransferFromId] = useState<string>("")
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferFieldErrors, setTransferFieldErrors] = useState<Record<string, string>>({})

  const [exchangeFromId, setExchangeFromId] = useState<string>("")
  const [exchangeAmount, setExchangeAmount] = useState("")
  const [exchangeError, setExchangeError] = useState<string | null>(null)
  const [exchangeFieldErrors, setExchangeFieldErrors] = useState<Record<string, string>>({})

  const usdAccount = accounts.find((a) => a.currency === "USD")
  const eurAccount = accounts.find((a) => a.currency === "EUR")

  function getAccountById(id: number): Account | undefined {
    return accounts.find((a) => a.id === id)
  }

  function handleTransfer(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setTransferError(null)
    setTransferFieldErrors({})
    const fromId = transferFromId === "" ? undefined : Number(transferFromId)
    const result = transferSchema.safeParse({
      from_account_id: fromId,
      to_account_id: transferToId,
      amount: transferAmount,
    })
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        if (path) errors[path] = issue.message
      }
      setTransferFieldErrors(errors)
      return
    }
    const fromAccount = getAccountById(result.data.from_account_id)
    if (fromAccount && result.data.amount && Number(result.data.amount) > fromAccount.balance) {
      setTransferError("Insufficient funds")
      return
    }
    transferMutation.mutate(
      {
        from_account_id: result.data.from_account_id,
        to_account_id: result.data.to_account_id,
        amount: result.data.amount,
      },
      {
        onSuccess: () => {
          setTransferToId("")
          setTransferAmount("")
          setTransferFromId("")
        },
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? String((err as { response?: { data?: unknown } }).response?.data ?? "Transfer failed")
              : "Transfer failed"
          setTransferError(msg)
        },
      }
    )
  }

  function handleExchange(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setExchangeError(null)
    setExchangeFieldErrors({})
    const fromId = exchangeFromId === "" ? undefined : Number(exchangeFromId)
    const toId =
      fromId === usdAccount?.id ? eurAccount?.id : fromId === eurAccount?.id ? usdAccount?.id : undefined
    if (fromId == null || toId == null) {
      setExchangeFieldErrors({ from_account_id: "Select source currency" })
      return
    }
    const result = exchangeSchema.safeParse({
      from_account_id: fromId,
      to_account_id: toId,
      amount: exchangeAmount,
    })
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        if (path) errors[path] = issue.message
      }
      setExchangeFieldErrors(errors)
      return
    }
    const fromAccount = getAccountById(result.data.from_account_id)
    if (fromAccount && result.data.amount && Number(result.data.amount) > fromAccount.balance) {
      setExchangeError("Insufficient funds")
      return
    }
    exchangeMutation.mutate(
      {
        from_account_id: result.data.from_account_id,
        to_account_id: result.data.to_account_id,
        amount: result.data.amount,
      },
      {
        onSuccess: () => {
          setExchangeAmount("")
          setExchangeFromId("")
        },
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? String((err as { response?: { data?: unknown } }).response?.data ?? "Exchange failed")
              : "Exchange failed"
          setExchangeError(msg)
        },
      }
    )
  }

  const exchangeFromAccount = exchangeFromId ? getAccountById(Number(exchangeFromId)) : null
  const exchangeToAccount =
    exchangeFromAccount?.currency === "USD" ? eurAccount : exchangeFromAccount?.currency === "EUR" ? usdAccount : null
  const exchangeAmountNum = exchangeAmount ? Number(exchangeAmount) : 0
  const convertedAmount =
    exchangeFromAccount?.currency === "USD" && exchangeToAccount
      ? exchangeAmountNum * USD_EUR_RATE
      : exchangeFromAccount?.currency === "EUR" && exchangeToAccount
        ? exchangeAmountNum / USD_EUR_RATE
        : 0

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* Balances */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Balances</h2>
          {accountsLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : (
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
          )}
        </section>

        {/* Last 5 transactions */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent transactions</h2>
          {transactionsLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions yet.</p>
          ) : (
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
                    {recentTransactions.map((tx, i) => (
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
          )}
        </section>

        {/* Transfer */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Transfer</CardTitle>
              <CardDescription>Send money to another account (same currency).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>From account</FieldLabel>
                      <Select
                        value={transferFromId}
                        onValueChange={setTransferFromId}
                        disabled={transferMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc, i) => (
                            <SelectItem key={acc.id ?? `acc-${i}`} value={String(acc.id)}>
                              {acc.currency} — {formatCurrency(acc.balance, acc.currency)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={
                          transferFieldErrors.from_account_id
                            ? [{ message: transferFieldErrors.from_account_id }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="transfer-to">Recipient account ID</FieldLabel>
                      <Input
                        id="transfer-to"
                        type="number"
                        min={1}
                        placeholder="Account ID"
                        value={transferToId}
                        onChange={(e) => setTransferToId(e.target.value)}
                        disabled={transferMutation.isPending}
                        aria-invalid={!!transferFieldErrors.to_account_id}
                      />
                      <FieldError
                        errors={
                          transferFieldErrors.to_account_id
                            ? [{ message: transferFieldErrors.to_account_id }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="transfer-amount">Amount</FieldLabel>
                      <Input
                        id="transfer-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={transferMutation.isPending}
                        aria-invalid={!!transferFieldErrors.amount}
                      />
                      <FieldError
                        errors={
                          transferFieldErrors.amount ? [{ message: transferFieldErrors.amount }] : undefined
                        }
                      />
                    </Field>
                  </FieldGroup>
                  {transferError && (
                    <p role="alert" className="text-destructive text-sm">
                      {transferError}
                    </p>
                  )}
                  <Button type="submit" disabled={transferMutation.isPending}>
                    {transferMutation.isPending ? "Transferring…" : "Transfer"}
                  </Button>
                </FieldSet>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Exchange */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Exchange</CardTitle>
              <CardDescription>
                Convert between your USD and EUR accounts. Rate: 1 USD = {USD_EUR_RATE} EUR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExchange} className="space-y-4">
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>From currency</FieldLabel>
                      <Select
                        value={exchangeFromId}
                        onValueChange={setExchangeFromId}
                        disabled={exchangeMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {usdAccount && (
                            <SelectItem key="usd" value={String(usdAccount.id)}>
                              USD — {formatCurrency(usdAccount.balance, "USD")}
                            </SelectItem>
                          )}
                          {eurAccount && (
                            <SelectItem key="eur" value={String(eurAccount.id)}>
                              EUR — {formatCurrency(eurAccount.balance, "EUR")}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={
                          exchangeFieldErrors.from_account_id
                            ? [{ message: exchangeFieldErrors.from_account_id }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="exchange-amount">Amount</FieldLabel>
                      <Input
                        id="exchange-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        disabled={exchangeMutation.isPending}
                        aria-invalid={!!exchangeFieldErrors.amount}
                      />
                      <FieldError
                        errors={
                          exchangeFieldErrors.amount ? [{ message: exchangeFieldErrors.amount }] : undefined
                        }
                      />
                    </Field>
                    {exchangeFromAccount && exchangeToAccount && exchangeAmountNum > 0 && (
                      <p className="text-muted-foreground text-sm">
                        You will receive{" "}
                        <strong>
                          {formatCurrency(convertedAmount, exchangeToAccount.currency)}
                        </strong>{" "}
                        ({exchangeToAccount.currency})
                      </p>
                    )}
                  </FieldGroup>
                  {exchangeError && (
                    <p role="alert" className="text-destructive text-sm">
                      {exchangeError}
                    </p>
                  )}
                  <Button type="submit" disabled={exchangeMutation.isPending}>
                    {exchangeMutation.isPending ? "Exchanging…" : "Exchange"}
                  </Button>
                </FieldSet>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
